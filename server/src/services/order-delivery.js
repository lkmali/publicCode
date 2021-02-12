var log = require("../logger/winston").LOG;
const Merchant = require('../database/models/merchant');
const errorFactory = require("../errorFactory/error-factory");
const MerchantItem = require('../database/models/merchant-item');
const OrderDelivery = require('../database/models/order-delivery');
const Order = require('../database/models/order');
const MerchantCart = require('../database/models/merchant-cart');
var messageServices = require('./message').MessageServices;
var distanceService = require('./distance').DistanceService;
const HelperService = require('./helper').HelperService;
const MerchantCartService = require('./merchantCart').MerchantCartService;
const Payment = require('../database/models/payment');

class OrderDeliveryService {
    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async createOrderDelivery(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await Order.findOne({_id: request.orderId}).populate("cart");
                if (!order) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let Items = await MerchantCartService.prototype.getMerchantCartItemForOrder(request);
                let merchantCartItem = [];
                let merchantList = {};
                for (let itemsKey in Items) {
                    if (Items.hasOwnProperty(itemsKey)) {
                        let data = Items[itemsKey];
                        let price = 0;
                        let id = "";
                        for (let index = 0; index < data.length; index++) {
                            merchantList[data[index].merchantId] = {
                                merchant: data[index].merchantId,
                                status: "Rejected"
                            };
                            if (!data[index].isDeleted && data[index].conformation && data[index].itemPrice < price) {
                                id = data[index].id;
                                price = data[index].itemPrice;
                                merchantList[data[index].merchantId] = {
                                    merchant: data[index].merchantId,
                                    status: "Confirmed"
                                };
                            } else {
                                if (!data[index].isDeleted && data[index].conformation && !id) {
                                    id = data[index].id;
                                    price = data[index].itemPrice;
                                    merchantList[data[index].merchantId] = {
                                        merchant: data[index].merchantId,
                                        status: "Confirmed"
                                    };
                                }
                            }
                        }
                        if (id) {
                            merchantCartItem.push(id);
                        }
                    }
                }

                if (order.cart.length !== merchantCartItem.length) {
                    return reject(errorFactory.invalidRequest("item is not conformation by all merchant"));
                }
                let orderDelivery = await OrderDelivery.findOne({
                    order: order._id,
                    status: "Pending",
                    isDeleted: false
                });
                if (orderDelivery) {
                    orderDelivery["merchantCart"] = merchantCartItem;
                    orderDelivery["modifiedBy"] = request.owner;
                    orderDelivery["modifiedAt"] = new Date();
                    orderDelivery["merchants"] = this.convertObjectIntoArray(merchantList)
                } else {
                    orderDelivery = new OrderDelivery({
                        order: order._id,
                        merchantCart: merchantCartItem,
                        merchants: this.convertObjectIntoArray(merchantList),
                        createdBy: request.owner
                    });
                }
                await orderDelivery.save();
                resolve(true);

            } catch (error) {
                log.error("OrderDeliveryService--> OrderDeliveryService-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });


    }


    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async getConformedOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = {
                    isDeleted: false,
                    status: {$in: ["Confirmed", "Delivered"]},
                    merchants: {$elemMatch: {merchant: request.merchantId}}
                };
                if (request.id) {
                    query["_id"] = request.id;
                    let orderDelivery = await OrderDelivery.findOne(query).populate([{
                        path: 'merchantCart',
                        model: 'merchantCart',
                        populate: [{
                            path: 'cart',
                            model: 'cart',
                            populate: {
                                path: 'item',
                                model: 'items'
                            }
                        }]
                    }]);
                    if (!orderDelivery) {
                        return reject(errorFactory.invalidRequest("invalid request"));
                    }
                    if (orderDelivery.hasOwnProperty("_doc") && orderDelivery._doc) {
                        orderDelivery = orderDelivery._doc;
                    }
                    orderDelivery["merchant"] = {
                        merchant: request.merchantId,
                        status: "Rejected"
                    };
                    for (let count = 0; count < orderDelivery.merchants.length; count++) {
                        if (orderDelivery.merchants[count].hasOwnProperty("_doc") && orderDelivery.merchants[count]._doc) {
                            orderDelivery.merchants[count] = orderDelivery.merchants[count]._doc;
                        }
                        if (orderDelivery.merchants[count].merchant.toString() === request.merchantId.toString()) {
                            orderDelivery["merchant"] = orderDelivery.merchants[count];
                        }

                    }

                    orderDelivery.merchantCart = this.getMerchantCartData(orderDelivery.merchantCart, request.merchantId);
                    resolve(orderDelivery);

                } else {
                    let orderDelivery = await OrderDelivery.find(query).populate("order").sort({_id: -1}).skip(parseInt(request.offset)).limit(parseInt(request.limit));
                    ;
                    for (let index = 0; index < orderDelivery.length; index++) {
                        if (orderDelivery[index].hasOwnProperty("_doc") && orderDelivery[index]._doc) {
                            orderDelivery[index] = orderDelivery[index]._doc;
                        }

                        orderDelivery[index]["merchant"] = {
                            merchant: request.merchantId,
                            status: "Rejected"
                        };
                        for (let count = 0; count < orderDelivery[index].merchants.length; count++) {
                            if (orderDelivery[index].merchants[count].hasOwnProperty("_doc") && orderDelivery[index].merchants[count]._doc) {
                                orderDelivery[index].merchants[count] = orderDelivery[index].merchants[count]._doc;
                            }
                            if (orderDelivery[index].merchants[count].merchant.toString() === request.merchantId.toString()) {
                                orderDelivery[index]["merchant"] = orderDelivery[index].merchants[count];
                            }

                        }

                        delete orderDelivery[index].merchants
                    }

                    resolve(orderDelivery);
                }


            } catch (error) {
                log.error("OrderDeliveryService--> OrderDeliveryService-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }


    async getPendingOrder(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = {};
                let query = {
                    isDeleted: false,
                    merchant: data.merchantId,
                    status: "PENDING"
                };
                const merchantCartResult = await MerchantCart.find(query).populate('order').skip(parseInt(data.offset)).limit(parseInt(data.limit));
                for (let index = 0; index < merchantCartResult.length; index++) {
                    if (merchantCartResult[index].hasOwnProperty("_doc") && merchantCartResult[index]._doc) {
                        merchantCartResult[index] = merchantCartResult[index]._doc;
                    }
                    if (!result.hasOwnProperty(merchantCartResult[index].order)) {
                        result[merchantCartResult[index].order._id] = {
                            createdAt: merchantCartResult[index].order.createdAt,
                            _id: merchantCartResult[index].order._id,
                            conformation: merchantCartResult[index].conformation
                        }
                    }
                }
                resolve(this.convertObjectIntoArray(result));
            } catch (error) {
                log.error("OrderDeliveryService--> getPendingOrder-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    getMerchantCartData(merchantCartResult, merchantId) {
        const conformData = [];
        const rejectedData = [];
        for (let index = 0; index < merchantCartResult.length; index++) {
            if (merchantCartResult[index].hasOwnProperty("_doc") && merchantCartResult[index]._doc) {
                merchantCartResult[index] = merchantCartResult[index]._doc;
            }
            let data = merchantCartResult[index];
            let request = {};
            if (data.merchant._id.toString() === merchantId.toString()) {
                conformData.push({
                    merchantId: data.merchant._id,
                    itemPrice: data.price,
                    cart: HelperService.prototype.prepareCartData(data.cart),
                    totalAmount: data.totalAmount,
                    status: "Confirmed"
                })
            } else {
                rejectedData.push({
                    merchantId: data.merchant._id,
                    itemPrice: data.price,
                    cart: HelperService.prototype.prepareCartData(data.cart),
                    totalAmount: data.totalAmount,
                    status: "Rejected"
                })
            }

        }
        return conformData.concat(rejectedData);
    }


    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async getOrderDelivery(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let orderDelivery = await OrderDelivery.findOne({
                    order: request.orderId
                }).populate("order").populate([{
                    path: 'merchantCart',
                    model: 'merchantCart',
                    populate: [{
                        path: 'cart',
                        model: 'cart',
                        populate: {
                            path: 'item',
                            model: 'items'
                        }
                    },
                        {
                            path: 'merchant',
                            model: 'merchant'
                        }]
                }]);
                if (!orderDelivery) {
                    return resolve({})
                }

                if (orderDelivery.hasOwnProperty("_doc") && orderDelivery._doc) {
                    orderDelivery = orderDelivery._doc;
                }

                orderDelivery.merchantCart = this.convertObjectIntoArray(this.filterDataByMerchantId(orderDelivery.merchantCart, orderDelivery.order.billingInfo.mapLocation.latlong));
                resolve(orderDelivery)
            } catch (error) {
                log.error("OrderDeliveryService--> createOrderDelivery-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });


    }

    convertObjectIntoArray(data) {
        let result = [];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                result.push(data[key]);
            }
        }
        return result;
    }

    async orderDeliverySuccessfully(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let orderDelivery = await OrderDelivery.findOne({
                    order: request.orderId,
                    status: "Confirmed"
                }).populate("order");
                if (!orderDelivery) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                await OrderDelivery.updateOne({_id: orderDelivery._id}, {
                    $set: {
                        status: "Delivered",
                        modifiedBy: request.owner,
                        modifiedAt: new Date()
                    }
                });

                await Order.updateOne({_id: orderDelivery.order._id}, {
                    $set: {
                        status: "Delivered",
                        modifiedBy: request.owner,
                        modifiedAt: new Date()
                    }
                });
                await MerchantCart.update({_id: {$in: orderDelivery.merchantCart}, order: request.orderId}, {
                    $set: {
                        status: "SELL",
                        modifiedBy: request.owner,
                        modifiedAt: new Date()
                    },

                }, {multi: true});
                await Payment.updateOne({_id: orderDelivery.order.payment}, {$set: {status: 'Paid'}});
                HelperService.prototype.sendMessageToUser(orderDelivery.order["billingInfo"], orderDelivery.order, "Delivered");
                resolve(true);
            } catch (error) {
                log.error("OrderDeliveryService--> orderDeliverySuccessfully-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    async conformOrderDelivery(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let orderDelivery = await OrderDelivery.findOne({
                    order: request.orderId,
                    status: "Pending"
                }).populate("order").populate([{
                    path: 'merchantCart',
                    model: 'merchantCart',
                    populate: [{
                        path: 'cart',
                        model: 'cart',
                        populate: {
                            path: 'item',
                            model: 'items'
                        }
                    }, {
                        path: 'merchant',
                        model: 'merchant',
                    }]
                }]);

                if (orderDelivery.hasOwnProperty("_doc") && orderDelivery._doc) {
                    orderDelivery = orderDelivery._doc;
                }
                let merchantCartIds = [];
                for (let index = 0; index < orderDelivery.merchantCart.length; index++) {
                    merchantCartIds.push(orderDelivery.merchantCart[index]._id);
                }
                let conformMerchant = await this.getConformMerchantCartData(orderDelivery.merchantCart, orderDelivery._id.toString());
                let pendingMerchantCart = await MerchantCart.find({
                    _id: {
                        $nin: merchantCartIds
                    },
                    order: request.orderId
                }).populate("merchant");
                let cancelMerchant = {};

                for (let index = 0; index < pendingMerchantCart.length; index++) {
                    if (pendingMerchantCart[index].hasOwnProperty("_doc") && pendingMerchantCart[index]._doc) {
                        pendingMerchantCart[index] = pendingMerchantCart[index]._doc;
                    }
                    let data = pendingMerchantCart[index];
                    if (!conformMerchant.hasOwnProperty(data.merchant._id.toString())) {
                        cancelMerchant[data.merchant._id.toString()] = {
                            mobileNo: data.merchant.phone,
                            userId: data.merchant.user,
                            orderDeliveryId: orderDelivery._id.toString(),
                        };
                    }
                }
                await OrderDelivery.updateOne({_id: orderDelivery._id}, {
                    $set: {
                        status: "Confirmed",
                        modifiedBy: request.owner,
                        modifiedAt: new Date()
                    }
                });
                await Order.updateOne({_id: orderDelivery.order._id}, {
                    $set: {
                        status: "Dispatch",
                        modifiedBy: request.owner,
                        modifiedAt: new Date()
                    }
                });
                await MerchantCart.update({_id: {$in: merchantCartIds}, order: request.orderId}, {
                    $set: {
                        status: "DISPATCH",
                        modifiedBy: request.owner,
                        modifiedAt: new Date()
                    },

                }, {multi: true});
                await MerchantCart.remove({_id: {$nin: merchantCartIds}, order: request.orderId});
                await this.broadCastOrderDeliveryStatusMessage(conformMerchant, "Confirmed");
                await this.broadCastOrderDeliveryStatusMessage(cancelMerchant, "Rejection");
                HelperService.prototype.sendMessageToUser(orderDelivery.order["billingInfo"], orderDelivery.order, "Dispatch");
                resolve(true);
            } catch (error) {
                log.error("OrderDeliveryService--> conformOrderDelivery-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    async broadCastOrderDeliveryStatusMessage(merchantList, status) {
        return new Promise(async (resolve, reject) => {
            try {
                for (let key in merchantList) {
                    if (merchantList.hasOwnProperty(key)) {
                        await HelperService.prototype.sendMessageToMerchant(merchantList[key], status);
                    }
                }
                resolve(true);
            } catch (error) {
                log.error("OrderDeliveryService--> broadCastOrderDeliveryStatusMessage-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    async getConformMerchantCartData(merchantCartResult, orderDeliveryId) {
        return new Promise(async (resolve, reject) => {
            try {
                const merchantList = {};
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
                            orderDeliveryId: orderDeliveryId,
                            items: [{
                                itemName: data.cart.item.name,
                                quantity: data.cart.quantity,
                                price: data.price
                            }]
                        }
                    }
                }
                resolve(merchantList)
            } catch (error) {
                log.error("OrderDeliveryService--> broadCartMessage-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    getItemsMessage(item) {
        let message = '';
        for (let index = 0; index < item.length; index++) {
            message = message + "" + (index + 1) + " " + item[index].itemName + " " + item[index].quantity + " pcs rate - " + item[index].price + "%n";
        }
        return message;

    }


    async sendMessage(phone, message) {
        return new Promise(async (resolve, reject) => {
            try {
                await messageServices.prototype.sendMessage(phone, message);
                resolve();
            } catch (error) {
                log.error("OrderDeliveryService--> sendMessage-->catch", error);
                resolve();
            }


        });
    }

    getMerchantOrder(order, status = "pending", link = "/") {
        return `Order From MTC reach you %nOrder  ${status}%nItem required:- %n${order}For more info please open ${link}`
    }

    getMerchantCancelOrder(order, status = "Cancel", link = "/") {
        //return `Order From MTC reach you%Order ${CANCEL}%nItem required:-%ndata%nFor more info please open ${status}`;
        return `Order From MTC reach you %nOrder  ${status}%nItem required:- %n${order}For more info please open ${link}`
    }

    filterDataByMerchantId(merchantCartResult, orderLocation) {
        let orderLateLong = orderLocation.replace(/ /g, '').split(",");
        const merchantData = {};
        for (let index = 0; index < merchantCartResult.length; index++) {
            if (merchantCartResult[index].hasOwnProperty("_doc") && merchantCartResult[index]._doc) {
                merchantCartResult[index] = merchantCartResult[index]._doc;
            }
            let data = merchantCartResult[index];
            if (merchantData.hasOwnProperty(data.merchant._id.toString())) {
                merchantData[data.merchant._id.toString()].items.push({
                    itemPrice: data.price,
                    cart: HelperService.prototype.prepareCartData(data.cart),
                    totalAmount: data.totalAmount
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
                        itemPrice: data.price,
                        cart: HelperService.prototype.prepareCartData(data.cart),
                        totalAmount: data.totalAmount
                    }]
                }

            }
        }
        return merchantData;
    }


}

module.exports.OrderDeliveryService = OrderDeliveryService;
