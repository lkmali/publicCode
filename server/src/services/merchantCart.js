var log = require("../logger/winston").LOG;
const Merchant = require('../database/models/merchant');
const errorFactory = require("../errorFactory/error-factory");
const MerchantItem = require('../database/models/merchant-item');
const Order = require('../database/models/order');
const MerchantCart = require('../database/models/merchant-cart');
var distanceService = require('./distance').DistanceService;
const HelperService = require('./helper').HelperService;


class MerchantCartService {
    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async addMerchantCartItemForOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let order = await Order.findOne({_id: request.orderId}).populate("cart");
                if (!order) {
                    return reject(errorFactory.invalidRequest("Invalid order ID"));
                }
                let itemsData = {};
                let merchantData = {};
                let merchant = await Merchant.find({isDeleted: false, pinCode: order.billingInfo.pinCode});
                if (!(merchant && merchant.length)) {
                    return resolve(false);
                }
                for (let index = 0; index < order.cart.length; index++) {
                    itemsData[order.cart[index].item] = {
                        cartId: order.cart[index]._id,
                        price: order.cart[index].actualAmount,
                        quantity: order.cart[index].quantity
                    };
                }
                for (let index = 0; index < merchant.length; index++) {
                    if (merchant[index].hasOwnProperty("_doc") && merchant[index]._doc) {
                        merchant[index] = merchant[index]._doc;
                    }
                    merchantData[merchant[index]._id] = merchant[index];
                }

                await this.setMerchantCartDataAndSendNotification(itemsData, merchantData, order._id);
                console.log("request.orderId", request.orderId);
                resolve(await this.broadCartMessage(order._id.toString(), "Approval"))

            } catch (error) {
                log.error("MerchantCartService--> addMerchantCartItemForOrder-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });


    }


    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async OnUpdateMerchantCartItemForOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let order = await Order.findOne({_id: request.orderId}).populate("cart");
                if (!order) {
                    return reject(errorFactory.invalidRequest("Invalid order ID"));
                }
                const cart = {};
                for (let index = 0; index < order.cart.length; index++) {
                    cart[order.cart[index]._id.toString()] = order.cart[index];
                }

                let merchantCartResult = await MerchantCart.find({
                    order: request.orderId,
                });
                for (let index = 0; index < merchantCartResult.length; index++) {
                    if (merchantCartResult[index].hasOwnProperty("_doc") && merchantCartResult[index]._doc) {
                        merchantCartResult[index] = merchantCartResult[index]._doc;
                    }
                    let data = merchantCartResult[index];
                    if (cart.hasOwnProperty(data.cart.toString())) {
                        await MerchantCart.updateOne({_id: data._id}, {
                            $set: {
                                totalAmount: cart[data.cart.toString()].quantity * data.price,
                                modifiedAt: new Date()
                            }
                        });
                    } else {
                        await MerchantCart.remove({_id: data._id});
                    }
                }
                resolve(await this.broadCartMessage(request.orderId, "Updated"))


            } catch (error) {
                log.error("MerchantCartService--> addMerchantCartItemForOrder-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });


    }

    async setMerchantCartDataAndSendNotification(itemsData, merchantData, orderId) {
        return new Promise(async (resolve, reject) => {
            try {
                let items = {};
                let data = await MerchantItem.find({
                    merchant: {$in: Object.keys(merchantData)},
                    item: {$in: Object.keys(itemsData)},
                    isDeleted: false
                }).populate("merchant");
                for (let index = 0; index < data.length; index++) {
                    if (data[index].hasOwnProperty("_doc") && data[index]._doc) {
                        data[index] = data[index]._doc;
                    }

                    let merchantCartResult = await MerchantCart.findOne({
                        merchant: data[index].merchant._id,
                        cart: itemsData[data[index].item].cartId,
                        order: orderId,
                    });
                    if (merchantCartResult) {
                        merchantCartResult["merchant"] = data[index].merchant._id;
                        merchantCartResult["cart"] = itemsData[data[index].item].cartId;
                        merchantCartResult["order"] = orderId;
                        merchantCartResult["price"] = data[index].price;
                        merchantCartResult["totalAmount"] = data[index].price * itemsData[data[index].item].quantity;
                        merchantCartResult["conformation"] = data[index].merchant.settings && data[index].merchant.settings.conformation === true;

                    } else {
                        let merchantCartObject = {
                            merchant: data[index].merchant._id,
                            cart: itemsData[data[index].item].cartId,
                            order: orderId,
                            price: itemsData[data[index].item].price,
                            totalAmount: itemsData[data[index].item].price * itemsData[data[index].item].quantity,
                            conformation: data[index].merchant.settings && data[index].merchant.settings.conformation === true
                        };
                        merchantCartResult = new MerchantCart(merchantCartObject);
                    }


                    await merchantCartResult.save();
                }
                resolve(true);
            } catch (error) {
                log.error("MerchantCartService--> setMerchantCartDataAndSendNotification-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async broadCartMessage(orderId, status) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                const merchantList = {};
                let merchantCartResult = await MerchantCart.find({
                    order: orderId,
                    status: "PENDING"
                }).populate("merchant").populate([{
                    path: 'cart',
                    model: 'cart',
                    populate: {
                        path: 'item',
                        model: 'items'
                    }
                }]);
                for (let index = 0; index < merchantCartResult.length; index++) {
                    if (merchantCartResult[index].hasOwnProperty("_doc") && merchantCartResult[index]._doc) {
                        merchantCartResult[index] = merchantCartResult[index]._doc;
                    }
                    let data = merchantCartResult[index];
                    if (merchantList.hasOwnProperty(data.merchant._id.toString())) {
                        merchantList[data.merchant._id.toString()].items.push({
                            itemName: data.cart.item.name,
                            quantity: data.cart.quantity,
                            price: data.price
                        })
                    } else {
                        merchantList[data.merchant._id.toString()] = {
                            mobileNo: data.merchant.phone,
                            userId: data.merchant.user,
                            orderId: orderId,
                            items: [{
                                itemName: data.cart.item.name,
                                quantity: data.cart.quantity,
                                price: data.price
                            }]
                        }
                    }
                }

                for (let key in merchantList) {
                    if (merchantList.hasOwnProperty(key)) {
                        await HelperService.prototype.sendMessageToMerchant(merchantList[key], status)
                    }
                }
                resolve(true);
            } catch (error) {
                log.error("MerchantCartService--> broadCartMessage-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }


    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async getMerchantCartItemForOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let query = {order: request.orderId, status: "PENDING"};
                if (request.merchantId) {
                    query["merchant"] = request.merchantId;
                }

                let merchantCartResult = await MerchantCart.find(query).populate("merchant").populate([{
                    path: 'cart',
                    model: 'cart',
                    populate: {
                        path: 'item',
                        model: 'items'
                    }
                }]);

                if (request.merchantId) {
                    resolve(this.prepareMerchantCartData(merchantCartResult));
                } else {
                    let order = await Order.findOne({_id: request.orderId}).populate("cart");
                    if (!order) {
                        return reject(errorFactory.invalidRequest("invalid request"));
                    }

                    resolve(this.filterDataByItemId(this.filterDataByMerchantId(merchantCartResult, order.billingInfo.mapLocation.latlong)))

                }
            } catch (error) {
                log.error("MerchantCartService--> getMerchantCartItemForOrder-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });


    }

    prepareMerchantCartData(data) {
        let conformation = false;
        for (let index = 0; index < data.length; index++) {
            if (data[index].hasOwnProperty("_doc") && data[index]._doc) {
                data[index] = data[index]._doc;
            }
            conformation = data[index]["conformation"];
            data[index]["cart"] = HelperService.prototype.prepareCartData(data[index]["cart"]);
        }
        return {
            data: data,
            conformation: conformation
        };


    }

    filterDataByItemId(merchantData) {
        let Items = {};
        for (let key in merchantData) {
            if (merchantData.hasOwnProperty(key)) {
                for (let index = 0; index < merchantData[key].items.length; index++) {
                    if (Items.hasOwnProperty(merchantData[key].items[index].itemId.toString())) {
                        Items[merchantData[key].items[index].itemId.toString()].push({
                            merchantId: merchantData[key].merchantId,
                            merchantName: merchantData[key].merchantName,
                            phone: merchantData[key].phone,
                            id: merchantData[key].items[index].id,
                            shopName: merchantData[key].shopName,
                            pinCode: merchantData[key].pinCode,
                            distance: merchantData[key].distance,
                            isDeleted: merchantData[key].items[index]["isDeleted"],
                            conformation: merchantData[key].items[index]["conformation"],
                            itemPrice: merchantData[key].items[index].itemPrice,
                            totalAmount: merchantData[key].items[index].totalAmount,
                            quantity: merchantData[key].items[index].quantity,
                        })
                    } else {
                        Items[merchantData[key].items[index].itemId.toString()] = [{
                            id: merchantData[key].items[index].id,
                            merchantId: merchantData[key].merchantId,
                            merchantName: merchantData[key].merchantName,
                            phone: merchantData[key].phone,
                            shopName: merchantData[key].shopName,
                            conformation: merchantData[key].items[index]["conformation"],
                            pinCode: merchantData[key].pinCode,
                            distance: merchantData[key].distance,
                            isDeleted: merchantData[key].items[index]["isDeleted"],
                            itemPrice: merchantData[key].items[index].itemPrice,
                            totalAmount: merchantData[key].items[index].totalAmount,
                            quantity: merchantData[key].items[index].quantity,
                        }]

                    }
                }
            }
        }

        for (let itemsKey in Items) {
            if (Items.hasOwnProperty(itemsKey)) {
                let data = Items[itemsKey];
                for (let index = 0; index < data.length; index++) {
                    for (let count = index + 1; count < data.length; count++) {
                        if (data[index]["distance"] > data[count]["distance"]) {
                            let temp = data[index];
                            data[index] = data[count];
                            data[count] = temp;
                        }
                    }
                }
            }
        }

        return Items;
    }

    filterDataByMerchantId(merchantCartResult, orderLocation) {
        const merchantData = {};
        let orderLateLong = orderLocation.replace(/ /g, '').split(",");
        for (let index = 0; index < merchantCartResult.length; index++) {
            if (merchantCartResult[index].hasOwnProperty("_doc") && merchantCartResult[index]._doc) {
                merchantCartResult[index] = merchantCartResult[index]._doc;
            }
            let data = merchantCartResult[index];
            if (merchantData.hasOwnProperty(data.merchant._id.toString())) {
                merchantData[data.merchant._id.toString()].items.push({
                    itemPrice: data.price,
                    itemId: data.cart.item._id,
                    totalAmount: data.totalAmount,
                    id: data._id,
                    isDeleted: data["isDeleted"],
                    conformation: data["conformation"],
                })
            } else {
                const distArray = data.merchant["mapLocation"].replace(/ /g, '').split(",");
                var distance = distanceService.prototype.getDistanceFromLatLonInMiter(orderLateLong[0], orderLateLong[1], distArray[0], distArray[1]);
                merchantData[data.merchant._id.toString()] = {
                    merchantId: data.merchant._id,
                    merchantName: data.merchant.name,
                    phone: data.merchant.phone,
                    shopName: data.merchant.shopName,
                    pinCode: data.merchant.pinCode,
                    distance: distance,
                    items: [{
                        conformation: data["conformation"],
                        itemPrice: data.price,
                        itemId: data.cart.item._id,
                        id: data._id,
                        isDeleted: data["isDeleted"],
                        totalAmount: data.totalAmount,
                    }]
                }

            }
        }
        return merchantData;
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

    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async updateMerchantCartByMerchant(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.id) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let merchantCartResult = await MerchantCart.findOne({
                    _id: request.id,
                    status: "PENDING",
                    merchant: request.merchantId,
                    conformation: false
                }).populate([{
                    path: 'cart',
                    model: 'cart'
                }]);
                merchantCartResult["modifiedBy"] = request.owner;
                merchantCartResult["modifiedAt"] = new Date();
                if (!merchantCartResult) {
                    return reject(errorFactory.invalidRequest("Invalid request"));
                }
                if (request.price) {
                    if (!this.checkQuantity(request.price)) {
                        return reject(errorFactory.invalidRequest("Invalid price"));
                    }
                    if (merchantCartResult["cart"]["actualAmount"] < parseInt(request.price)) {
                        return reject(errorFactory.invalidRequest("Price can't be more the actual item price"));
                    }
                    merchantCartResult["price"] = parseInt(request.price);
                    merchantCartResult["totalAmount"] = parseInt(request.price) * merchantCartResult.cart.quantity;
                }
                if (request.hasOwnProperty("isDeleted")) {
                    merchantCartResult["isDeleted"] = request.isDeleted
                }
                await merchantCartResult.save();
                resolve(true);

            } catch (error) {
                log.error("MerchantCartService--> UpdateMerchantByAdmin-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });


    }


    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async updateMerchantByAdmin(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.id) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let merchantCartResult = await MerchantCart.findOne({
                    _id: request.id,
                    status: "PENDING"
                }).populate([{
                    path: 'cart',
                    model: 'cart'
                }]);
                merchantCartResult["modifiedBy"] = request.owner;
                merchantCartResult["modifiedAt"] = new Date();
                if (!merchantCartResult) {
                    return reject(errorFactory.invalidRequest("Invalid request"));
                }
                if (request.price) {
                    if (!this.checkQuantity(request.price)) {
                        return reject(errorFactory.invalidRequest("Invalid price"));
                    }
                    if (merchantCartResult["cart"]["actualAmount"] < parseInt(request.price)) {
                        return reject(errorFactory.invalidRequest("Price can't be more the actual item price"));
                    }
                    merchantCartResult["price"] = parseInt(request.price);
                    merchantCartResult["totalAmount"] = parseInt(request.price) * merchantCartResult.cart.quantity;
                }
                if (request.hasOwnProperty("isDeleted")) {
                    merchantCartResult["isDeleted"] = request.isDeleted
                }

                await merchantCartResult.save();
                if (request.hasOwnProperty("conformation")) {
                    await this.conformMerchantData({
                        merchant: merchantCartResult.merchant,
                        order: merchantCartResult.order,
                        status: "PENDING"
                    }, {
                        modifiedBy: request.owner,
                        modifiedAt: new Date(),
                        conformation: request.conformation === true || request.conformation === 'true'
                    })
                }
                resolve(true);

            } catch (error) {
                log.error("MerchantCartService--> UpdateMerchantByAdmin-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    /**
     *conformAllItemByMerchant
     * @returns {Promise<void>}
     * @param request
     */
    async conformAllItemByMerchant(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId && !(request.merchantCart && request.merchantCart.length)) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }

                for (let index = 0; index < request.merchantCart.length; index++) {
                    await this.updateMerchantByAdmin({
                        id: request.merchantCart[index].id,
                        owner: request.owner,
                        price: request.merchantCart[index].price,
                        isDeleted: request.merchantCart[index].isDeleted || false

                    })
                }
                let result = await MerchantCart.findOne({
                    merchant: request.merchantId,
                    order: request.orderId,
                    status: "PENDING"
                }).populate("merchant");
                if (!result) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }

                await this.conformMerchantData({
                    merchant: request.merchantId,
                    order: request.orderId,
                    status: "PENDING"
                }, {
                    modifiedBy: request.owner,
                    modifiedAt: new Date(),
                    conformation: true
                });

                HelperService.prototype.orderConformByMerchant(request.orderId, {
                    name: result.merchant.name,
                    shopName: result.merchant.shopName
                });
                resolve(true);
            } catch (error) {
                log.error("MerchantCartService--> conformAllItemByMerchant-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    async conformMerchantData(query, data) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await MerchantCart.update(query,
                    {$set: data},
                    {multi: true}
                );
                resolve(result);

            } catch (error) {
                log.error("MerchantCartService-->conformMerchantData-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }
}

module.exports.MerchantCartService = MerchantCartService;
