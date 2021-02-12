var log = require("../logger/winston").LOG;
const Cart = require('../database/models/cart');
const Item = require('../database/models/item');
const Fcm = require('../database/models/fcm');
const errorFactory = require("../errorFactory/error-factory");
const HelperService = require('./helper').HelperService;
const GuestCart = require('../database/models/guest-cart');

class CartService {
    /**
     * cart add
     * @returns {Promise<void>}
     * @param request
     */
    async addCart(request) {
        return new Promise(async (resolve, reject) => {
            try {

                if (!request.CartData) {
                    request.CartData = Cart;
                }
                if (!request.propertyId) {
                    return reject(errorFactory.invalidRequest("missing propertyId"));
                }
                let result = {};

                if (!this.checkQuantity(request.quantity)) {
                    return reject(errorFactory.invalidRequest("Invalid Quantity"));
                }
                request.quantity = parseInt(request.quantity);
                if (request.quantity === 0) {
                    result = await this.deleteItemFromCart(request);
                } else {
                    let item = await Item.findOne({_id: request.item, isDeleted: false, stock: "AVAILABLE"});
                    if (!item) {
                        return reject(errorFactory.invalidRequest("Item not found ot unavailable"));
                    }
                    let propertyData = HelperService.prototype.getPropertyObject(item.property);
                    const property = propertyData[request.propertyId];
                    if (!propertyData[request.propertyId]) {
                        return reject(errorFactory.invalidRequest("invalid propertyId"));
                    }
                    let cart = await request.CartData.findOne({
                        isDeleted: false,
                        item: request.item,
                        user: request.owner,
                        propertyId: request.propertyId,
                        status: "PENDING"
                    });
                    if (cart) {
                        cart["quantity"] = request.quantity;
                        cart["actualAmount"] = property.price;
                        cart["totalAmount"] = this.getTotalAmount(property.price, request.quantity);
                        cart["propertyId"] = request.propertyId;
                        cart["weight"] = property.quantity + " " + item.unit;
                    } else {
                        cart = new request.CartData({
                            quantity: request.quantity,
                            actualAmount: property.price,
                            user: request.owner,
                            guest: request.guest,
                            totalAmount: this.getTotalAmount(property.price, request.quantity),
                            propertyId: request.propertyId,
                            weight: property.quantity + " " + item.unit,
                            item: request.item
                        })
                    }
                    result = await cart.save();
                }
                resolve(result);
            } catch (error) {
                log.error("addCart-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    /**
     * cart add
     * @returns {Promise<void>}
     * @param request
     */
    async transferCartData(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = {
                    status: "PENDING"
                };
                var CartData = GuestCart;
                var TempCartData = Cart;
                var owner = request.owner;
                const guest = request.guest;
                if (owner) {
                    query["user"] = guest;
                    CartData = Cart;
                    TempCartData = GuestCart;
                } else {
                    query["guest"] = guest;
                }


                let cart = await TempCartData.find(query);
                if (cart && cart.length) {
                    for (let index = 0; index < cart.length; index++) {
                        var data = cart[index];
                        if (data.hasOwnProperty("_doc") && data._doc) {
                            data = data._doc;
                        }
                        await this.addCart({
                            quantity: data.quantity,
                            item: data.item,
                            guest: guest,
                            propertyId: data.propertyId,
                            owner: request.owner || guest,
                            CartData: CartData
                        })
                    }
                    await TempCartData.remove(query);
                }
                if (owner) {
                    let result = await Fcm.findOne({guest: guest, type:  "APP"});
                    if (result) {
                        result["user"] = owner;
                        result["modifiedBy"] = owner;
                        result["createdBy"] = owner;
                    }
                    await result.save();
                }
                resolve(true);
            } catch (error) {
                log.error("transferCartData-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * we are getting all user
     * @param request
     */
    async getCart(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let result = await request.CartData.findOne({
                        _id: request.id,
                        isDeleted: false,
                        user: request.owner,
                        status: "PENDING"
                    });
                    resolve(HelperService.prototype.prepareCartData(result));
                } else {
                    let query = {
                        isDeleted: false,
                        user: request.owner,
                        status: "PENDING"
                    };
                    const count = await request.CartData.find(query).countDocuments();
                    let result = await request.CartData.find(query).sort({_id: -1}).skip(parseInt(request.offset)).limit(parseInt(request.limit)).populate("item");
                    const cartData = HelperService.prototype.prepareCartsData(result, true);

                    resolve({total: count, records: cartData.cart, cartTotalSum: cartData.totalSum})
                }
            } catch (error) {
                log.error("CategoryService-->getCart-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    checkQuantity(data) {
        try {
            if (!isNaN(data) && parseInt(data) >= 0) {
                return true;
            }
        } catch (e) {
            return false;
        }
    }

    getTotalAmount(price, quantity) {
        return parseFloat(price) * parseInt(quantity);
    }

    /**
     * deleteAddress addressBook
     * @returns {Promise<void>}
     * @param request
     */
    async deleteItemFromCart(request) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await request.CartData.remove({
                    item: request.item,
                    user: request.owner,
                    propertyId: request.propertyId,
                    status: "PENDING"
                }));
            } catch (error) {
                log.error("deleteItemFromCart-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.CartService = CartService;
