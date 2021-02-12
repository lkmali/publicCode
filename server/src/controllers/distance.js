var responseService = require('../middleware/response');
const Distance = require('../services').Distance;


class DistanceController {

    constructor() {
        this.distanceService = new Distance();
    }

    async getDeliveryBoyDistance(req, res) {
        try {
            let result = await this.distanceService.getDeliveryBoyDistance(req.params.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantDistance(req, res) {
        try {
            let result = await this.distanceService.getMerchantDistance(req.params.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantDistanceWithItem(req, res) {
        try {
            let result = await this.distanceService.getMerchantDistanceWithItem(req.params.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async sendMessageToMerchant(req, res) {
        try {
            let result = await this.distanceService.sendMessageToMerchant(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.DistanceController = DistanceController;
