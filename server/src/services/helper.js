var log = require("../logger/winston").LOG;
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
const Cart = require('../database/models/cart');
const GuestCart = require('../database/models/guest-cart');
const fcmService = require('./fcm').FcmService;
const dynamicLinkServices = require('./dynamicLink').DynamicLinkServices;
var config = require('../../config');
const Item = require('../database/models/item');

class HelperService {
    constructor() {
    }

    getPropertyObject(data) {
        const result = {};
        if (data) {
            for (let index = 0; index < data.length; index++) {
                result[data[index]._id.toString()] = data[index];
            }
        }
        return result;

    }

    convertObjectIntoArray(data) {
        const result = [];
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                result.push(data[key])
            }
        }
        return result;
    }

    makeid(length) {
        var result = '';
        var characters = '0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    getCartObject(data) {
        if (data.owner) {
            return Cart
        } else {
            return GuestCart;
        }
    }

    getInvoiceNo(length) {
        var result = '';
        var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return "MTC" + result;
    }

    createItemsImage(data, CartData = Cart, owner = null) {
        return new Promise(async (resolve, reject) => {
            try {
                for (let index = 0; index < data.length; index++) {
                    if (owner) {
                        let cart = await CartData.find({
                            item: data[index]._id,
                            isDeleted: false,
                            user: owner,
                            status: "PENDING"
                        });
                        data[index] = this.createItemImage(data[index], cart);
                    } else {
                        data[index] = this.createItemImage(data[index]);
                    }

                }
                resolve(data)
            } catch (error) {
                log.error("HelperService-->getImageBase64-->", error);
                resolve(data)
            }
        });

    }

    createCartItemImage(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        const propertyData = {};
        if (data.property && data.property.length) {
            for (let index = 0; index < data.property.length; index++) {
                if (data.property[index].hasOwnProperty("_doc") && data.property[index]._doc) {
                    data.property[index] = data.property[index]._doc;
                }
                propertyData[data.property[index]._id.toString()] = data.property[index];
                data.property[index]["actualPrice"] = this.convertNoToString(data.property[index]["actualPrice"] || data.property[index]["price"])
                data.property[index]["price"] = this.convertNoToString(data.property[index]["price"])
            }
        }
        data["price"] = this.convertNoToString(data.price);
        data["gst"] = this.convertNoToString(data.gst);
        if (data.preview) {
            data.preview = "product/image/item/itemPreview/" + data._id.toString() + "?" + Date.now();
        }

        if (data.images) {
            let image = {};
            for (let key in data.images) {
                if (data.images.hasOwnProperty(key)) {
                    image[key] = "product/image/item/" + key + "/" + data._id.toString() + "?" + Date.now();
                }
            }
            data.images = image;
        }
        return {item: data, propertyData: propertyData};


    }

    createItemImage(data, cart = null) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        const cartData = {};
        const propertyData = {};
        if (data.property && data.property.length) {
            for (let index = 0; index < data.property.length; index++) {
                if (data.property[index].hasOwnProperty("_doc") && data.property[index]._doc) {
                    data.property[index] = data.property[index]._doc;
                }
                cartData[data.property[index]._id.toString()] = {
                    quantity: 0,
                    propertyId: data.property[index]._id.toString(),
                    totalAmount: "0"
                };
                propertyData[data.property[index]._id.toString()] = data.property[index];
                data.property[index]["actualPrice"] = this.convertNoToString(data.property[index]["actualPrice"] || data.property[index]["price"])
                data.property[index]["price"] = this.convertNoToString(data.property[index]["price"])
            }
        }

        if (cart && cart.length) {
            for (let count = 0; count < cart.length; count++) {
                if (cart[count].hasOwnProperty("_doc") && cart[count]._doc) {
                    cart[count] = cart[count]._doc;
                }
                const property = propertyData[cart[count].propertyId];
                if (property) {
                    cartData[cart[count].propertyId.toString()] = {
                        quantity: cart[count].quantity,
                        propertyId: cart[count].propertyId,
                        totalAmount: this.convertNoToString(parseFloat(property.price) * parseFloat(cart[count].quantity))
                    };
                }

            }

        }
        if (cart) {
            data["cart"] = this.convertObjectIntoArray(cartData);
        }
        data["price"] = this.convertNoToString(data.price);
        data["gst"] = this.convertNoToString(data.gst);
        if (data.preview) {
            data.preview = "product/image/item/itemPreview/" + data._id.toString() + "?" + Date.now();
        }

        if (data.images) {
            let image = {};
            for (let key in data.images) {
                if (data.images.hasOwnProperty(key)) {
                    image[key] = "product/image/item/" + key + "/" + data._id.toString() + "?" + Date.now();
                }
            }
            data.images = image;
        }
        return data;


    }


    prepareCartsData(data, isCart = false) {
        if (isCart) {
            let totalSum = 0;
            for (let index = 0; index < data.length; index++) {
                const result = this.prepareCartData(data[index], isCart);
                data[index] = result.cart;
                totalSum = totalSum + result.totalAmount
            }
            return {cart: data, totalSum: this.convertNoToString(totalSum)};
        } else {
            for (let index = 0; index < data.length; index++) {
                data[index] = this.prepareCartData(data[index], isCart)
            }
            return data;
        }
    }

    prepareCartData(data, isCart = false) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        if (data.hasOwnProperty("gstText")) {
            data["gstText"] = this.convertNoToString(data.gstText);
        }
        if (data.hasOwnProperty("gst")) {
            data["gst"] = this.convertNoToString(data.gst);
        }
        if (data.hasOwnProperty("totalAmount")) {
            data["totalAmount"] = this.convertNoToString(data.totalAmount);
        }
        if (data.hasOwnProperty("price")) {
            data["price"] = this.convertNoToString(data.price);
        }
        if (data.hasOwnProperty("actualAmount")) {
            data["actualAmount"] = this.convertNoToString(data.actualAmount);
        }
        if (isCart) {
            var totalAmount = 0;
            if (data.item) {
                let imageResult = this.createCartItemImage(data.item);
                data.item = imageResult.item;
                const propertyData = imageResult.propertyData;
                const property = propertyData[data.propertyId];
                if (property) {
                    totalAmount = totalAmount + parseFloat(property.price) * parseFloat(data.quantity);
                    data["actualAmount"] = this.convertNoToString(property.price);
                    data["totalAmount"] = this.convertNoToString(parseFloat(property.price) * parseFloat(data.quantity));
                }
            }
            return {cart: data, totalAmount: totalAmount}

        } else {
            if (data.item) {
                data.item = this.createItemImage(data.item);
            }
            return data;
        }

    }

    preparePaymentData(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        data["actualAmount"] = this.convertNoToString(data.actualAmount);
        data["discountAmount"] = this.convertNoToString(data.discountAmount);
        data["taxAmount"] = this.convertNoToString(data.taxAmount);
        data["cGst"] = this.convertNoToString(data.cGst);
        data["sGst"] = this.convertNoToString(data.sGst);
        data["cGst"] = this.convertNoToString(data.cGst);
        data["total"] = this.convertNoToString(data.total);
        return data;
    }

    createOfferImage(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        if (data.preview) {
            data.preview = "product/image/offerImage/offerImagePreview/" + data._id.toString() + "?" + Date.now();
        }
        return data;


    }

    createOfferImages(data) {
        for (let index = 0; index < data.length; index++) {
            data[index] = this.createOfferImage(data[index])
        }

        return data;


    }

    createCategoryImage(data) {
        for (let index = 0; index < data.length; index++) {
            if (data[index].hasOwnProperty("_doc") && data[index]._doc) {
                data[index] = data[index]._doc;
            }

            if (data[index].preview) {
                data[index].preview = "product/image/category/itemPreview/" + data[index]._id.toString() + "?" + Date.now();
            }
        }
        return data;
    }


    createMerchantCategorysImage(data) {
        for (let index = 0; index < data.length; index++) {
            data[index] = this.createMerchantCategoryImage(data[index]);
        }
        return data;
    }

    createMerchantCategoryImageByAdmin(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        if (data.category.preview) {
            data.category.preview = "product/image/category/itemPreview/" + data.category._id.toString() + "?" + Date.now();
        }
        return data;
    }

    createMerchantCategorysImageByAdmin(data) {
        for (let index = 0; index < data.length; index++) {
            data[index] = this.createMerchantCategoryImageByAdmin(data[index]);
        }
        return data;
    }

    createMerchantCategoryImage(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        if (data.category.preview) {
            data.category.preview = "product/image/category/itemPreview/" + data.category._id.toString() + "?" + Date.now();
        }
        return data.category;
    }


    createMerchantItemsImage(data, owner) {
        for (let index = 0; index < data.length; index++) {
            data[index] = this.createMerchantItemImage(data[index], owner);
        }
        return data;
    }

    createMerchantItemImageByAdmin(data) {
        if (data.hasOwnProperty("_doc") && data._doc) {
            data = data._doc;
        }
        data.item = this.createItemImage(data.item);
        return data;
    }

    createMerchantItemsImageByAdmin(data) {
        for (let index = 0; index < data.length; index++) {
            data[index] = this.createMerchantItemImageByAdmin(data[index]);
        }
        return data;
    }

    createMerchantItemImage(data, owner) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data.hasOwnProperty("_doc") && data._doc) {
                    data = data._doc;
                }
                let cart = await Cart.find({
                    item: data.item._id,
                    isDeleted: false,
                    user: owner,
                    status: "PENDING"
                });
                data = this.createItemImage(data.item, cart);
            } catch (error) {
                log.error("HelperService-->createMerchantItemImage-->", error);
                resolve(data)
            }
        });
    }


    async getImageBase64(files, key) {
        return new Promise(async (resolve, reject) => {
            try {
                if (files && files[key]) {
                    let file = files[key];
                    resolve(new Buffer(file.data).toString('base64'));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("HelperService-->getImageBase64-->", error);
                reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
            }
        });
    }


    convertNoToString(num) {
        if (num) {
            return parseFloat(num).toFixed(2)
        } else {
            return "00.00";
        }

    }

    async setItemShareLink(info, itemId) {
        return new Promise(async (resolve, reject) => {
            try {
                const link = `${config.web}/item?itemId=${itemId}&&type=item`;
                let dynamicLink = await dynamicLinkServices.prototype.getItemLinkShare(link, info);

                let result = await Item.update({_id: itemId}, {$set: {shareLink: dynamicLink.shortLink}});
                console.log(result);
                resolve();
            } catch (error) {
                log.error("HelperService--> sendMessageToMerchant-->catch", error);
                resolve();
            }


        });
    }

    async sendMessageToMerchant(merchantList, status) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = {
                    body: "",
                    title: "",
                    type: "",
                    event: "",
                    link: ""
                };
                let message = "";
                if (status === "Approval") {
                    const link = `${config.web}/merchant/pending/order/view/${merchantList.orderId}?orderId=${merchantList.orderId}&&type=merchantApproval`;
                    let dynamicLink = await dynamicLinkServices.prototype.getDynamicLink(link, config.androidApp.merchant);
                    message = this.getApprovalMerchantOrderSMS(status, `${dynamicLink.shortLink}`);
                    data.body = this.getApprovalMerchantOrderFCM(status, link);
                    data.title = "Order from MTC REACHYOU: Order approval";
                    data.type = "ORDER_APPROVAL";
                    data.event = "ORDER_APPROVAL";
                    data.link = link;
                    data["orderId"] = merchantList.orderId.toString();
                } else if (status === "Updated") {
                    const link = `${config.web}/merchant/pending/order/view/${merchantList.orderId}?orderId=${merchantList.orderId}&&type=merchantApproval`;
                    let dynamicLink = await dynamicLinkServices.prototype.getDynamicLink(link, config.androidApp.merchant);
                    message = this.getApprovalMerchantOrderSMS(status, `${dynamicLink.shortLink}`);
                    data.body = this.getApprovalMerchantOrderFCM(status, link);
                    data.title = "Order from MTC REACHYOU: Order Updated";
                    data.type = "ORDER_UPDATE";
                    data.link = link;
                    data.event = "ORDER_UPDATE_" + merchantList.orderId;
                    data["orderId"] = merchantList.orderId.toString();
                } else if (status === "Confirmed") {
                    const link = `${config.web}/merchant/conform/order/view/${merchantList.orderId}?orderDeliveryId=${merchantList.orderDeliveryId}&&type=merchantConfirmed`;
                    let dynamicLink = await dynamicLinkServices.prototype.getDynamicLink(link, config.androidApp.merchant);
                    message = this.getConfirmedMerchantOrderSMS(status, `${dynamicLink.shortLink}`);
                    data.body = this.getConfirmedMerchantOrderFCM(config.web + "/merchant/conform/order/view/" + merchantList.orderDeliveryId);
                    data.title = "Order from MTC REACHYOU: Order Confirmed";
                    data.type = "ORDER_CONFORM";
                    data.event = "ORDER_CONFORM";
                    data.link = link;
                    data["orderDeliveryId"] = merchantList.orderDeliveryId.toString();
                } else {
                    const link = `${config.web}/merchant/conform/order/view/${merchantList.orderId}?orderDeliveryId=${merchantList.orderDeliveryId}&&type=merchantConfirmed`;
                    let dynamicLink = await dynamicLinkServices.prototype.getDynamicLink(link, config.androidApp.merchant);
                    message = this.getRejectionMerchantOrderSMS(status, `${dynamicLink.shortLink}`);
                    data.body = this.getRejectionMerchantOrderFCM(link);
                    data.title = "Order from MTC REACHYOU: Order Rejection";
                    data.type = "ORDER_REJECT";
                    data.event = "ORDER_CONFORM";
                    data.link = link;
                    data["orderDeliveryId"] = merchantList.orderDeliveryId.toString();
                }
                fcmService.prototype.notifyMerchant(data, {
                    user: merchantList.userId,
                    message: message,
                    phone: merchantList.mobileNo
                });
                resolve();
            } catch (error) {
                log.error("HelperService--> sendMessageToMerchant-->catch", error);
                resolve();
            }


        });
    }

    async orderConformByMerchant(orderId, merchantData) {
        return new Promise(async (resolve, reject) => {
            try {
                let data = {
                    body: "Order Conform From " + merchantData.name + "( " + merchantData.shopName + ") merchant",
                    title: "Order Conform From " + merchantData.name + "( " + merchantData.shopName + ") merchant",
                    type: "ORDER_CONFORM_BY_MERCHANT",
                    event: "ORDER_CONFORM_BY_MERCHANT_" + orderId,
                    orderId: orderId.toString(),
                    link: config.web + "/admin/order/view/" + orderId
                };
                fcmService.prototype.notifyAdmin(data, false);
                resolve();
            } catch (error) {
                log.error("HelperService--> orderConformByMerchant-->catch", error);
                resolve();
            }


        });
    }

    getApprovalMerchantOrderSMS(status, link = "/") {
        return `Order from MTC REACHYOU:%nOrder ${status}%n Please Open the below link and approve the Item Price with 2 min other wise your item will be reject %nFor more info please open ${link}`
    }

    getApprovalMerchantOrderFCM(status, link = "/") {
        return `Please Open the below link and approve the Item Price with 2 min other wise your item will be reject \n For more info please open the above link `
    }

    getConfirmedMerchantOrderSMS(link = "/") {
        return `Order from MTC REACHYOU:%nOrder Confirmed%n Your some item got confirmed.%nSo please open the below link and check%n Please Pack the Confirmed product as per requirement delivery boy will contact you shortly.%nFor more info please open ${link}`
    }

    getConfirmedMerchantOrderFCM(link = "/") {
        return `Your some item got confirmed.\n So please open the below link and check\n Please Pack the Confirmed product as per requirement delivery boy will contact you shortly.\n For more info please open the above link`
    }


    getRejectionMerchantOrderSMS(link = "/") {
        return `Order from MTC REACHYOU:%nOrder Rejection%n Sorry Order Got Rejected Due to High Rates%nSo please open the below link and check sell product price .%nFor more info please open ${link}`
    }

    getRejectionMerchantOrderFCM(link = "/") {
        return ` Sorry Order Got Rejected Due to High Rates\n So please open the below link and check sell product price.\n For more info please open the above link`
    }

    async sendMessageToUser(user, orderData, status) {
        return new Promise(async (resolve, reject) => {
            try {
                const link = `${config.web}/user/order?orderId=${orderData._id.toString()}&&type=orderPage`;
                let dynamicLink = await dynamicLinkServices.prototype.getDynamicLink(link, config.androidApp.user);
                let data = {
                    body: `Hi,  ${user.name} Your order ${orderData.orderId} has been ${status}`,
                    title: `Hi,  ${user.name} Your order ${orderData.orderId} has been ${status}`,
                    status: status,
                    event: status,
                    targetIntent: "OrderSummary",
                    id: orderData._id.toString(),
                    orderId: orderData.orderId.toString()
                };
                let message = this.getOrderMessage(user.name, orderData.orderId, `${dynamicLink.shortLink}`, status);
                fcmService.prototype.notifyMerchant(data, {
                    user: orderData.user,
                    message: message,
                    phone: user.mobileNo
                });
                resolve();
            } catch (error) {
                log.error("HelperService--> sendMessageToUser-->catch", error);
                resolve();
            }


        });
    }

    /*  sendMessageToUser(phone, message) {
          return new Promise(async (resolve, reject) => {
              try {
                  await messageServices.prototype.sendMessage(phone, message);
                  resolve();
              } catch (error) {
                  log.error("HelperService-->sendMessageToUser-->", error);
                  resolve();
              }


          });
      }*/

    getOrderMessage(userName, orderNo, link = "/", status = "confirmed") {
        return `Hi,  ${userName} Your order ${orderNo} has been ${status} . To check your status please click on ${link}`;
    }
}

module.exports.HelperService = HelperService;
