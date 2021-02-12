var responseService = require('../middleware/response');
const OrderDelivery = require('../services').OrderDelivery;
const MerchantCartService = require('../services').MerchantCartService;

class OrderDeliveryController {

    constructor() {
        this.orderDeliveryService = new OrderDelivery();
        this.merchantCartService = new MerchantCartService();
    }

    async createOrderDelivery(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.orderDeliveryService.createOrderDelivery(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async conformOrderDelivery(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.orderDeliveryService.conformOrderDelivery(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getPendingOrder(req, res) {
        try {
            let result = "";
            if (req.query.orderId) {
                result = await this.merchantCartService.getMerchantCartItemForOrder({
                    orderId: req.query.orderId,
                    merchantId: req.user.merchantId
                });
            } else {
                let data = {
                    offset: req.query.offset || 0,
                    limit: req.query.limit || 20,
                    merchantId: req.user.merchantId
                };
                result = await this.orderDeliveryService.getPendingOrder(data);
            }
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getConformedOrder(req, res) {
        try {
            let data = {
                id: req.query.id || null,
                merchantId: req.user.merchantId,
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
            };
            let result = await this.orderDeliveryService.getConformedOrder(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async orderDeliverySuccessfully(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let data = {
                id: req.query.id || ""
            }
            let result = await this.orderDeliveryService.orderDeliverySuccessfully(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getOrderDelivery(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["orderId"] = req.params.orderId;
            let result = await this.orderDeliveryService.getOrderDelivery(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.OrderDeliveryController = OrderDeliveryController;
