var responseService = require('../middleware/response');
const MerchantCart = require('../services').MerchantCartService;


class MerchantCartController {

    constructor() {
        this.merchantCartService = new MerchantCart();
    }

    async addMerchantCart(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.merchantCartService.addMerchantCartItemForOrder(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async updateMerchantByAdmin(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.merchantCartService.updateMerchantByAdmin(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMerchantCartByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantCartService.updateMerchantCartByMerchant(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantCartByAdmin(req, res) {
        try {
            let result = await this.merchantCartService.getMerchantCartItemForOrder({orderId: req.params.orderId});
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantCartByMerchant(req, res) {
        try {
            let result = await this.merchantCartService.getMerchantCartItemForOrder({
                orderId: req.params.orderId,
                merchantId: req.params.id
            });
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async conformAllItemByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantCartService.conformAllItemByMerchant(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.MerchantCartController = MerchantCartController;
