const express = require('express');
const router = express.Router();
const Controllers = require('../controllers');
const MerchantService = require('../services/merchant').MerchantService;
const config = require('../../config.js');
const jwt = new (require("./Jwt").Jwt)();
const swaggerUi = require('swagger-ui-express');
var swaggerDocument = require("../../api/swagger");
var responseService = require('./response');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
var clientAuthentication = require('./authentication/clientAuthentication').ClientAuthentication;
setup = (app) => {
    const account = new Controllers.Account();
    const item = new Controllers.Item();
    const category = new Controllers.Category();
    const address = new Controllers.Address();
    const cart = new Controllers.Cart();
    const order = new Controllers.Order();
    const merchant = new Controllers.Merchant();
    const deliveryBoy = new Controllers.DeliveryBoy();
    const distance = new Controllers.Distance();
    const offerImage = new Controllers.OfferImage();
    const merchantItem = new Controllers.MerchantItem();
    const merchantCategory = new Controllers.MerchantCategory();
    const merchantCart = new Controllers.MerchantCart();
    const orderDelivery = new Controllers.OrderDelivery();
    const unit = new Controllers.Unit();
    if (config.swagger.enable) {
        swaggerDocument.host = config.swagger.swaggerHost;
        swaggerDocument.parameters.clientSecret.required = config.clientAuthentication.clientAuthenticationEnable;
        swaggerDocument.parameters.clientId.required = config.clientAuthentication.clientAuthenticationEnable;
        swaggerDocument.host = config.swagger.swaggerHost;
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
            swaggerOptions: {
                authAction: {
                    JWT: {
                        name: "JWT",
                        schema: {type: "apiKey", in: "header", name: "Authorization", description: ""},
                        value: "Bearer <JWT>"
                    }
                }
            }
        }));
    }
    if (config.clientAuthentication.clientAuthenticationEnable) {
        app.use("/api", clientAuthentication.validateRequest().unless({path: config.clientAuthentication.excludeAuthentication}));
    }
    app.use("/api", jwt.verify({secret: jwt.secretRecruitCallBack}).unless({path: config.api.excludeAuthentication}));
    app.use("/api/open", jwt.verifyOpenApi());

    ///Account API
    router.post("/api/account/sendOtp", account.sendOtp.bind(account));
    router.post("/api/account/verifyPhone", account.verifyMobileNo.bind(account));
    router.post("/api/user", account.updateUser.bind(account));

    router.put("/api/user/active/:action", authorize(["admin"], account.userAction.bind(account)));
    router.put("/api/user/", authorize(["admin"], account.userAction.bind(account)));
    router.put("/api/user/fcm", account.updateFcm.bind(account));
    router.delete("/api/user/:id", authorize(["admin"], account.deleteUser.bind(account)));
    router.get("/api/user", authorize(["admin"], account.getOrganizationUser.bind(account)));

    router.get("/api/user/details", merchant.getUserDetails.bind(merchant));
    router.post("/api/user/details", merchant.addUserDetails.bind(merchant));
    ///Category

    router.post("/api/category", authorize(["admin"], category.add.bind(category)));
    router.get("/api/category", category.getCategory.bind(category));
    router.put("/api/category/active/:action", authorize(["admin"], category.categoryAction.bind(category)));
    router.get("/api/category/admin", authorize(["admin"], category.getCategoryByAdmin.bind(category)));
    router.put("/api/category/:id", authorize(["admin"], category.update.bind(category)));

    router.post("/api/category/file", authorize(["admin"], category.uploadFile.bind(category)));

    ///Item

    router.post("/api/item", authorize(["admin"], item.add.bind(item)));
    router.put("/api/item/images/:id", authorize(["admin"], item.addItemImages.bind(item)));
    router.get("/api/item", item.getItem.bind(item));
    router.get("/api/item/admin", authorize(["admin"], item.getItemByAdmin.bind(item)));
    router.put("/api/item/active/:action", authorize(["admin"], item.itemAction.bind(item)));
    router.put("/api/item/stock/:action", authorize(["admin"], item.stockAction.bind(item)));
    router.put("/api/item/:id", authorize(["admin"], item.update.bind(item)));
    router.put("/api/item", authorize(["admin"], item.updateMultipleItem.bind(item)));

    ///Address Books

    router.post("/api/address", address.addAddress.bind(address));
    router.get("/api/address", address.getAddress.bind(address));
    router.put("/api/address/:id", address.updateAddress.bind(address));
    router.delete("/api/address/:id", address.deleteAddress.bind(address));


    ///Cart

    router.post("/api/cart", cart.addCart.bind(cart));
    router.get("/api/cart", cart.getCart.bind(cart));


    ///Order

    router.post("/api/order", order.createOrder.bind(order));
    router.post("/api/order/message", authorize(["admin"], distance.sendMessageToMerchant.bind(distance)));
    router.get("/api/order", order.getOrder.bind(order));
    router.get("/api/order/admin", authorize(["admin"], order.getAdminOrder.bind(order)));
    router.put("/api/order/status/:id", authorize(["admin"], order.changeOrderStatus.bind(order)));
    router.put("/api/order/:id", order.updateOrder.bind(order));
    router.put("/api/order/cancel/:id", order.cancelOrderStatus.bind(order));
    router.put("/api/order/reorder/:id", order.reOrder.bind(order));
    router.get("/api/order/invoice/:orderId", order.downloadOrderInvoice.bind(order));
    router.get("/api/order/admin/invoice/:orderId", authorize(["admin"], order.downloadAdminOrderInvoice.bind(order)));
    ///Delivery Boy

    router.post("/api/deliveryBoy", authorize(["admin"], deliveryBoy.AddDeliveryBoy.bind(deliveryBoy)));
    router.put("/api/deliveryBoy/active/:action", authorize(["admin"], deliveryBoy.deliveryBoyAction.bind(deliveryBoy)));
    router.get("/api/deliveryBoy", authorize(["admin"], deliveryBoy.getDeliveryBoyByAdmin.bind(deliveryBoy)));
    router.put("/api/deliveryBoy/:id", authorize(["admin"], deliveryBoy.updateDeliveryBoy.bind(deliveryBoy)));
    router.delete("/api/deliveryBoy/:id", authorize(["admin"], deliveryBoy.deleteDeliveryBoy.bind(deliveryBoy)));
    router.post("/api/deliveryBoy/file", authorize(["admin"], deliveryBoy.uploadFile.bind(deliveryBoy)));


    ///merchant Boy

    router.put("/api/merchant/active/:action", authorize(["admin"], merchant.merchantAction.bind(merchant)));
    router.get("/api/merchant/admin", authorize(["admin"], merchant.getMerchantByAdmin.bind(merchant)));
    router.put("/api/merchant/:id", authorize(["admin"], merchant.updateMerchant.bind(merchant)));
    router.delete("/api/merchant/:id", authorize(["admin"], merchant.deleteMerchant.bind(merchant)));
    router.post("/api/merchant/file", authorize(["admin"], merchant.uploadFile.bind(merchant)));

    router.post("/api/merchant/send/order", authorize(["admin"], merchant.sendFinalItemOrderToMerchant.bind(merchant)));

    router.post("/api/offerImage", authorize(["admin"], offerImage.addOfferImage.bind(offerImage)));
    router.put("/api/offerImage/active/:action", authorize(["admin"], offerImage.offerImageAction.bind(offerImage)));
    router.get("/api/offerImage/admin", authorize(["admin"], offerImage.getOfferImageByAdmin.bind(offerImage)));
    router.get("/api/offerImage", offerImage.getOfferImage.bind(offerImage));
    router.delete("/api/offerImage/:id", authorize(["admin"], offerImage.deleteOfferImage.bind(offerImage)));

    ////   Distance
    router.get("/api/distance/deliveryBoy/:id", authorize(["admin"], distance.getDeliveryBoyDistance.bind(distance)));
    router.get("/api/distance/merchant/:id", authorize(["admin"], distance.getMerchantDistance.bind(distance)));
    router.get("/api/distance/order/merchant/:id", authorize(["admin"], distance.getMerchantDistanceWithItem.bind(distance)));
    //Image Path
    router.get("/api/product/image/:type/:imageType/:id", item.imageStream.bind(item));

    ///////// merchantIem
    router.post("/api/merchant/item/admin", authorize(["admin"], merchantItem.addMerchantItemsByAdmin.bind(merchantItem)));
    router.put("/api/merchant/item/admin", authorize(["admin"], merchantItem.updateMerchantItemsByAdmin.bind(merchantItem)));
    router.put("/api/merchant/item/delete/admin", authorize(["admin"], merchantItem.deleteMerchantItemsByAdmin.bind(merchantItem)));
    router.get("/api/merchant/item/admin", authorize(["admin"], merchantItem.getMerchantItemsByAdmin.bind(merchantItem)));
    router.get("/api/merchant/item/unselected/admin", authorize(["admin"], merchantItem.getUnselectedMerchantItemByAdmin.bind(merchantItem)));
    router.put("/api/merchant/item/admin/price", authorize(["admin"], merchantItem.updateMerchantItemsPriceByAdmin.bind(merchantItem)));

    router.post("/api/merchant/item/merchant", getUserDetails(), authorize(["merchant"], merchantItem.addMerchantItemsByMerchant.bind(merchantItem)));
    router.put("/api/merchant/item/merchant", getUserDetails(), authorize(["merchant"], merchantItem.updateMerchantItemsByMerchant.bind(merchantItem)));
    router.put("/api/merchant/item/delete/merchant", getUserDetails(), authorize(["merchant"], merchantItem.deleteMerchantItemsByMerchant.bind(merchantItem)));
    router.get("/api/merchant/item/merchant", getUserDetails(), authorize(["merchant"], merchantItem.getMerchantItemsByMerchant.bind(merchantItem)));
    router.get("/api/merchant/item/unselected/merchant", getUserDetails(), authorize(["merchant"], merchantItem.getUnselectedMerchantItemByMerchant.bind(merchantItem)));
    router.put("/api/merchant/item/merchant/price", getUserDetails(), authorize(["merchant"], merchantItem.updateMerchantItemsPriceByMerchant.bind(merchantItem)));
    ///////// merchantcategory
    router.post("/api/merchant/category/admin", authorize(["admin"], merchantCategory.addMerchantCategoriesByAdmin.bind(merchantCategory)));
    router.put("/api/merchant/category/admin", authorize(["admin"], merchantCategory.updateMerchantCategoriesByAdmin.bind(merchantCategory)));
    router.put("/api/merchant/category/delete/admin", authorize(["admin"], merchantCategory.deleteMerchantCategoriesByAdmin.bind(merchantCategory)));
    router.get("/api/merchant/category/admin", authorize(["admin"], merchantCategory.getMerchantCategoriesByAdmin.bind(merchantCategory)));
    router.get("/api/merchant/category/unselected/admin", authorize(["admin"], merchantCategory.getUnselectedMerchantCategoriesByAdmin.bind(merchantCategory)));


    router.post("/api/merchantCart", authorize(["admin"], merchantCart.addMerchantCart.bind(merchantCart)));
    router.put("/api/merchantCart/admin", authorize(["admin"], merchantCart.updateMerchantByAdmin.bind(merchantCart)));
    router.get("/api/merchantCart/admin/:orderId", authorize(["admin"], merchantCart.getMerchantCartByAdmin.bind(merchantCart)));
    router.put("/api/merchantCart/conform", getUserDetails(), authorize(["merchant"], merchantCart.conformAllItemByMerchant.bind(merchantCart)));
    router.get("/api/merchantCart/merchant", getUserDetails(), authorize(["merchant"], orderDelivery.getPendingOrder.bind(orderDelivery)));
    router.put("/api/merchantCart/merchant", getUserDetails(), authorize(["merchant"], merchantCart.updateMerchantCartByMerchant.bind(merchantCart)));


    router.put("/api/orderDelivery/admin/delivered", authorize(["admin"], orderDelivery.orderDeliverySuccessfully.bind(orderDelivery)));
    router.post("/api/orderDelivery", authorize(["admin"], orderDelivery.createOrderDelivery.bind(orderDelivery)));
    router.put("/api/orderDelivery", authorize(["admin"], orderDelivery.conformOrderDelivery.bind(orderDelivery)));
    router.get("/api/orderDelivery/admin/:orderId", authorize(["admin"], orderDelivery.getOrderDelivery.bind(orderDelivery)));
    router.get("/api/orderDelivery/merchant", getUserDetails(), authorize(["merchant"], orderDelivery.getConformedOrder.bind(orderDelivery)));


    router.post("/api/merchant/category/merchant", getUserDetails(), authorize(["merchant"], merchantCategory.addMerchantCategoriesByMerchant.bind(merchantCategory)));
    router.put("/api/merchant/category/merchant", getUserDetails(), authorize(["merchant"], merchantCategory.updateMerchantCategoriesByMerchant.bind(merchantCategory)));
    router.put("/api/merchant/category/delete/merchant", getUserDetails(), authorize(["merchant"], merchantCategory.deleteMerchantCategoriesByMerchant.bind(merchantCategory)));
    router.get("/api/merchant/category/merchant", getUserDetails(), authorize(["merchant"], merchantCategory.getMerchantCategoriesByMerchant.bind(merchantCategory)));
    router.get("/api/merchant/category/unselected/merchant", getUserDetails(), authorize(["merchant"], merchantCategory.getUnselectedMerchantCategoriesByMerchant.bind(merchantCategory)));

    ////

    // all Open API

    router.get("/api/open/category", category.getCategory.bind(category));
    router.get("/api/open/item", item.getItem.bind(item));
    router.post("/api/open/cart", cart.addCart.bind(cart));
    router.get("/api/open/cart", cart.getCart.bind(cart));
    router.get("/api/open/skip", cart.transferCartData.bind(cart));
    router.get("/api/open/offerImage", offerImage.getOfferImage.bind(offerImage));
    router.post("/api/open/fcm", account.addFcmToken.bind(account));

    router.post("/api/unit", authorize(["admin"], unit.addUnit.bind(unit)));
    router.get("/api/unit", authorize(["admin"], unit.getUnit.bind(unit)));
    router.delete("/api/unit/:name", authorize(["admin"], unit.deleteUnit.bind(unit)));
    //################# check subscriptions routes
    app.use(router);
};
const getUserDetails = () => {
    return async (req, res, next) => {
        let userData = await MerchantService.prototype.getMerchantByAdmin({
            user: req.user.id
        });
        if (userData) {
            req.user["merchantId"] = userData._id;
            next()
        } else {
            responseService.response(req, errorFactory.unauthorizedRequest(message.UNAUTHORIZED_REQUEST), null, res)
        }

    }
};

function authorize(role, next) {
    return (req, res) => {
        if (req.user && role.indexOf(req.user.role) >= 0) {
            next(req, res);
        } else {
            responseService.response(req, errorFactory.unauthorizedRequest(message.UNAUTHORIZED_REQUEST), null, res)
        }
    }
}

module.exports = {setup};
