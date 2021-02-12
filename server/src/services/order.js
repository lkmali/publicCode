var log = require("../logger/winston").LOG;
const Cart = require('../database/models/cart');
const Order = require('../database/models/order');
const Payment = require('../database/models/payment');
const AddressBook = require('../database/models/address-book');
const errorFactory = require("../errorFactory/error-factory");
const HelperService = require('./helper').HelperService;
const fcmService = require('./fcm').FcmService;
var generatePdfService = require('./generatePdf').GeneratePdfService;
var cartService = require('./cart').CartService;
const MerchantCartService = require('./merchantCart').MerchantCartService;
var config = require('../../config');

class OrderService {
    /**
     * createOrder
     * @returns {Promise<void>}
     * @param request
     */
    async createOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let error = false;
                let message = "";
                if (!request.addressId || !(request.cart && request.cart.length)) {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }
                let addressBook = await AddressBook.findOne({
                    _id: request.addressId,
                    isDeleted: false,
                    user: request.owner
                });
                if (!addressBook) {
                    return reject(errorFactory.invalidRequest("Invalid addressId"));
                }
                const trackingId = HelperService.prototype.getInvoiceNo(8);
                var payment = {
                    actualAmount: 0,
                    discountAmount: 0,
                    taxAmount: 0,
                    cGst: 0,
                    sGst: 0,
                    total: 0,
                    createdBy: request.owner,
                    trackingId: trackingId
                };
                var orderDetails = {
                    billingInfo: {
                        name: addressBook.name,
                        mobileNo: addressBook.mobileNo,
                        pinCode: addressBook.pinCode,
                        houseNo: addressBook.houseNo,
                        mapLocation: addressBook.mapLocation,
                        area: addressBook.area,
                        landmark: addressBook.landmark,
                        state: addressBook.state,
                        city: addressBook.city,
                        country: addressBook.country,
                    },
                    cart: [],
                    orderId: trackingId,
                    isDeleted: false,
                    createdBy: request.owner,
                    user: request.owner
                };
                var cartUpdateRequest = [];
                for (let index = 0; index < request.cart.length; index++) {
                    let cartItem = await Cart.findOne({
                        _id: request.cart[index]["id"],
                        isDeleted: false,
                        user: request.owner,
                        status: "PENDING"
                    }).populate("item");
                    if (!cartItem) {
                        error = true;
                        message = "invalid Request";
                        break;
                    }
                    if (cartItem && cartItem.item.stock !== "AVAILABLE") {
                        error = true;
                        message = cartItem.item.name + "out of stock";
                        break;

                    }
                    const propertyData = HelperService.prototype.getPropertyObject(cartItem.item.property);
                    const property = propertyData[cartItem.propertyId];
                    orderDetails.cart.push(cartItem._id);
                    let price = (property.price * (100 / (100 + cartItem.item.gst))) * cartItem.quantity;
                    let gstText = (price * cartItem.item.gst) / 100;
                    payment.actualAmount = payment.actualAmount + price;
                    payment.taxAmount = payment.taxAmount + gstText;

                    cartUpdateRequest.push({
                        id: cartItem._id,
                        data: {
                            price: price,
                            gstText: gstText,
                            gst: cartItem.item.gst,
                            actualAmount: property.price,
                            status: "SELL",
                            totalAmount: property.price * cartItem.quantity

                        }
                    })
                }

                if (error) {
                    return reject(errorFactory.invalidRequest(message));
                }
                payment.total = payment.actualAmount + payment.taxAmount;
                payment.cGst = payment.taxAmount / 2;
                payment.sGst = payment.taxAmount / 2;

                let paymentResult = await new Payment(payment).save();

                orderDetails["payment"] = paymentResult._id;
                let orderResult = await new Order(orderDetails).save();
                await this.updateCartData(cartUpdateRequest);
                await Order.updateOne({_id: orderResult._id}, {$set: {isDeleted: false}});
                HelperService.prototype.sendMessageToUser(addressBook, orderResult, "confirmed");
                fcmService.prototype.notifyAdmin(this.getNewOrderNotification(orderResult._id, addressBook.name));
                MerchantCartService.prototype.addMerchantCartItemForOrder({orderId: orderResult._id});
                resolve(true);

            } catch (error) {
                log.error("OrderService-->createOrder-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    getNewOrderNotification(orderId, userName) {
        return {
            body: "New Order received from " + userName,
            title: "new order receive ",
            type: "NEW_ORDER_RECEIVED",
            event: "NEW_ORDER_RECEIVED",
            link: config.web + "/admin/order/view/" + orderId,
            orderId: orderId.toString()
        }
    }

    getUpdateOrderNotification(orderId, userName) {
        return {
            body: "Order update from " + userName,
            title: "order update",
            type: "ORDER_UPDATE",
            link: config.web + "/admin/order/view/" + orderId,
            event: "ORDER_UPDATE_" + orderId,
            orderId: orderId.toString()
        }
    }


    /**
     * we are getting all user
     * @param request
     */
    async getOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let result = await Order.findOne({
                        _id: request.id,
                        isDeleted: false,
                        user: request.owner
                    }).populate("payment").populate([{
                        path: 'cart',
                        model: 'cart',
                        populate: {
                            path: 'item',
                            model: 'items'
                        }
                    }]);
                    resolve(this.prepareOrderData(result));
                } else {
                    let query = {
                        isDeleted: false,
                        user: request.owner
                    };
                    if (request.status) {
                        query["status"] = request.status;
                    }
                    const count = await Order.find(query).countDocuments();
                    let result = await Order.find(query).sort({_id: -1}).skip(parseInt(request.offset)).limit(parseInt(request.limit)).populate("payment");
                    resolve({total: count, records: this.prepareOrdersData(result)})
                }
            } catch (error) {
                log.error("OrderService-->getOrder-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * we are getting all user
     * @param data
     */
    async changeOrderStatus(data) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log("data.status", data.status);
                if (data.status) {
                    let order = await Order.findOne({_id: data.id, status: {$ne: "Delivered"}});
                    if (!order) {
                        return reject(errorFactory.invalidRequest("invalid order Id"));
                    }
                    await Order.updateOne({_id: order._id}, {$set: {status: data.status}});
                    HelperService.prototype.sendMessageToUser(order["billingInfo"], order, data.status);
                    resolve(true);
                } else {
                    return reject(errorFactory.invalidRequest("invalid request"));
                }

            } catch (error) {
                log.error("OrderService-->changeOrderStatus-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * we are getting all user
     * @param data
     */
    async updateCartData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                for (let index = 0; index < data.length; index++) {
                    await Cart.updateOne({
                        _id: data[index].id
                    }, {$set: data[index].data})
                }
                resolve(true)
            } catch (error) {
                log.error("OrderService-->updateCartData-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * we are getting all user
     * @param request
     */
    async getAdminOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let result = await Order.findOne({
                        isDeleted: false,
                        _id: request.id
                    }).populate("payment").populate([{
                        path: 'cart',
                        model: 'cart',
                        populate: {
                            path: 'item',
                            model: 'items'
                        }
                    }]);
                    resolve(this.prepareOrderData(result));
                } else {
                    let query = {isDeleted: false};
                    if (request.status) {
                        query["status"] = request.status;
                    }
                    const count = await Order.find(query).countDocuments();
                    let result = await Order.find(query).sort({modifiedAt: -1}).skip(parseInt(request.offset)).limit(parseInt(request.limit)).populate("payment");
                    resolve({total: count, records: this.prepareOrdersData(result)})
                }
            } catch (error) {
                log.error("OrderService-->getCart-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    /**
     * we are getting all user
     * @param request
     * @param res
     */
    async downloadOrderInvoice(request, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await Order.findOne({
                    isDeleted: false,
                    _id: request.orderId,
                    user: request.owner
                }).populate("payment").populate([{
                    path: 'cart',
                    model: 'cart',
                    populate: {
                        path: 'item',
                        model: 'items'
                    }
                }]);
                let carData = this.prepareOrderData(result);
                let doc = generatePdfService.prototype.createInvoice(carData);

                res.writeHead(200, {
                    'Content-Type': 'application/pdf'
                });
                doc.pipe(res);
            } catch (error) {
                log.error("OrderService-->getCart-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * we are getting all user
     * @param request
     * @param res
     */
    async downloadAdminOrderInvoice(request, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await Order.findOne({
                    isDeleted: false,
                    _id: request.orderId
                }).populate("payment").populate([{
                    path: 'cart',
                    model: 'cart',
                    populate: {
                        path: 'item',
                        model: 'items'
                    }
                }]);
                let carData = this.prepareOrderData(result);
                let doc = generatePdfService.prototype.createInvoice(carData);

                res.writeHead(200, {
                    'Content-Type': 'application/pdf'
                });
                doc.pipe(res);
            } catch (error) {
                log.error("OrderService-->getCart-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    prepareOrdersData(data) {
        for (let index = 0; index < data.length; index++) {
            data[index] = this.prepareOrderData(data[index])
        }
        return data;


    }

    prepareOrderData(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        if (data.cart) {
            data.cart = HelperService.prototype.prepareCartsData(data.cart);
        }
        if (data.payment) {
            data.payment = HelperService.prototype.preparePaymentData(data.payment);
        }
        return data;


    }


    getOrderMessage(userName, orderNo, status = "confirmed") {
        return `Hi, ${userName} Your order \n ${orderNo} has been ${status} .
To check your status please click on App `;
    }


    /**
     * createOrder
     * @returns {Promise<void>}
     * @param request
     */
    async updateOrder(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.orderId) {
                    return reject(errorFactory.invalidRequest("missing orderId"));
                }
                let orders = await Order.findOne({
                    _id: request.orderId,
                    isDeleted: false,
                    user: request.owner
                });

                if (!(orders && ["Delivered", 'Cancel', "Replace", "Dispatch"].indexOf(orders.status) < 0)) {
                    return reject(errorFactory.invalidRequest("Invalid Order Id"));
                }

                if (request.addressId) {
                    let addressBook = await AddressBook.findOne({
                        _id: request.addressId,
                        isDeleted: false,
                        user: request.owner
                    });
                    if (!addressBook) {
                        return reject(errorFactory.invalidRequest("Invalid addressId"));
                    }
                    orders["billingInfo"] = {
                        name: addressBook.name,
                        mobileNo: addressBook.mobileNo,
                        pinCode: addressBook.pinCode,
                        houseNo: addressBook.houseNo,
                        mapLocation: addressBook.mapLocation,
                        area: addressBook.area,
                        landmark: addressBook.landmark,
                        state: addressBook.state,
                        city: addressBook.city,
                        country: addressBook.country,
                    }
                }

                if (request.cart && request.cart.length) {
                    const data = await this.updateOrderCartData(request.cart, request.owner);
                    orders["cart"] = data.cart;
                    await Payment.updateOne({_id: orders.payment}, {$set: data.payment});
                    await this.updateCartData(data.cartUpdateRequest);
                }
                orders["modifiedBy"] = request.owner;
                await orders.save();
                HelperService.prototype.sendMessageToUser(orders["billingInfo"], orders, "Updated");
                fcmService.prototype.notifyAdmin(this.getUpdateOrderNotification(orders._id, orders["billingInfo"].name));
                MerchantCartService.prototype.OnUpdateMerchantCartItemForOrder({orderId: orders._id});
                resolve(true);

            } catch (error) {
                log.error("OrderService-->updateOrder-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    /**
     * we are getting all user
     * @param data
     */
    async cancelOrderStatus(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await Order.findOne({_id: data.orderId, user: data.owner, status: {$ne: "Delivered"}});
                if (!(order && order.status !== "Replace")) {
                    return reject(errorFactory.invalidRequest("invalid order Id"));
                }
                order["status"] = "Cancel";
                order["modifiedAt"] = new Date();
                order["modifiedBy"] = data.owner;

                await order.save();
                HelperService.prototype.sendMessageToUser(order["billingInfo"], order, "Cancel");
                resolve(true);
            } catch (error) {
                log.error("OrderService-->changeOrderStatus-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    /**
     * we are getting all user
     * @param data
     */
    async reOrder(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let order = await Order.findOne({
                    _id: data.orderId,
                    isDeleted: false,
                    user: data.owner
                }).populate("cart");
                if (!order) {
                    return reject(errorFactory.invalidRequest("invalid order Id"));
                }
                for (let index = 0; index < order.cart.length; index++) {
                    await cartService.prototype.addCart({
                        quantity: order.cart[index].quantity,
                        item: order.cart[index].item,
                        owner: data.owner,
                        propertyId: data.propertyId
                    })
                }
                resolve(true);
            } catch (error) {
                log.error("OrderService-->reOrderStatus-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    /**
     * cart add
     * @returns {Promise<void>}
     * @param cartData
     * @param owner
     */
    async updateOrderCartData(cartData, owner) {
        return new Promise(async (resolve, reject) => {
            try {
                let error = "";
                const result = {
                    cart: [],
                    payment: {
                        actualAmount: 0,
                        discountAmount: 0,
                        taxAmount: 0,
                        cGst: 0,
                        sGst: 0,
                        total: 0,
                        modifiedBy: owner
                    },
                    cartUpdateRequest: []
                };
                for (let index = 0; index < cartData.length; index++) {
                    let data = cartData[index];
                    let request = {};
                    if (!this.checkQuantity(data.quantity)) {
                        error = "Invalid Quantity";
                        break;
                        // return reject(errorFactory.invalidRequest());
                    }
                    request["quantity"] = parseInt(data.quantity);
                    if (request.quantity === 0) {
                        await this.deleteItemFromCart({owner: owner, id: data.id});
                    } else {
                        let cartItem = await Cart.findOne({
                            _id: data.id
                        }).populate("item");
                        if (!cartItem) {
                            error = "Invalid cart id";
                            break;
                        }
                        if (cartItem && cartItem.item.stock !== "AVAILABLE") {
                            error = true;
                            error = cartItem.item.name + "out of stock";
                            break;

                        }
                        const propertyData = HelperService.prototype.getPropertyObject(cartItem.item.property);
                        const property = propertyData[cartItem.propertyId];
                        result.cart.push(cartItem._id);
                        let price = (property.price * (100 / (100 + cartItem.item.gst))) * request.quantity;
                        let gstText = (price * cartItem.item.gst) / 100;
                        result.payment.actualAmount = result.payment.actualAmount + price;
                        result.payment.taxAmount = result.payment.taxAmount + gstText;

                        result.cartUpdateRequest.push({
                            id: cartItem._id,
                            data: {
                                price: price,
                                gstText: gstText,
                                gst: cartItem.item.gst,
                                quantity: request.quantity,
                                actualAmount: property.price,
                                status: "SELL",
                                totalAmount: property.price * request.quantity

                            }
                        })
                    }

                }

                if (error) {
                    return reject(errorFactory.invalidRequest(error))
                }
                result.payment.total = result.payment.actualAmount + result.payment.taxAmount;
                result.payment.cGst = result.payment.taxAmount / 2;
                result.payment.sGst = result.payment.taxAmount / 2;
                resolve(result);

            } catch (error) {
                log.error("updateOrderCartData-->catch", error);
                return reject(errorFactory.dataBaseError(error));
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

    /**
     * deleteAddress addressBook
     * @returns {Promise<void>}
     * @param request
     */
    async deleteItemFromCart(request) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await Cart.remove({_id: request.id, user: request.owner}));
            } catch (error) {
                log.error("deleteItemFromCart-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

}

module.exports.OrderService = OrderService;
