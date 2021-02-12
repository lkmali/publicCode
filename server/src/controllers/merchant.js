var responseService = require('../middleware/response');
const Merchant = require('../services').Merchant;
const DeliveryBoy = require('../services').DeliveryBoy;

class MerchantController {

    constructor() {
        this.merchantService = new Merchant();
        this.deliveryBoy = new DeliveryBoy();
    }

    async addUserDetails(req, res) {
        try {
            req.body["owner"] = req.user.id;
            if (req.user.role.toLowerCase() === "merchant") {
                let result = await this.merchantService.AddMerchant(req.body);
                responseService.response(req, null, result, res);
            } else if ((req.user.role.toLowerCase() === "deliveryboy")) {
                let result = await this.deliveryBoy.AddDeliveryBoy(req.body);
                responseService.response(req, null, result, res);
            } else {
                responseService.response(req, {
                    code: "INVALID_REQUEST",
                    statusCode: 208,
                    message: "invalid request"
                }, null, res);
            }
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async uploadFile(req, res) {
        try {
            let result = await this.merchantService.uploadFile(req.files.merchantFile);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.merchantService.updateMerchant(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.merchantService.deleteMerchant(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantByAdmin(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id
        };
        try {
            let result = await this.merchantService.getMerchantByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getUserDetails(req, res) {
        let data = {
            user: req.user.id
        };
        try {
            if (req.user.role.toLowerCase() === "merchant") {
                let result = await this.merchantService.getMerchantByAdmin(data);
                responseService.response(req, null, result, res);
            } else if ((req.user.role.toLowerCase() === "deliveryboy")) {
                let result = await this.deliveryBoy.getDeliveryBoyByAdmin(data);
                responseService.response(req, null, result, res);
            } else {
                responseService.response(req, {
                    code: "INVALID_REQUEST",
                    statusCode: 208,
                    message: "invalid request"
                }, null, res);
            }
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async sendFinalItemOrderToMerchant(req, res) {
        let data = {
            user: req.user.id
        };
        try {
            let result = await this.merchantService.sendFinalItemOrderToMerchant(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async merchantAction(req, res) {
        try {
            let result = await this.merchantService.merchantAction({
                id: req.body.id,
                action: req.params.action,
                owner: req.user.id
            });
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.MerchantController = MerchantController;
