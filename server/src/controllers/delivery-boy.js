var responseService = require('../middleware/response');
const DeliveryBoy = require('../services').DeliveryBoy;


class DeliveryBoyController {

    constructor() {
        this.deliveryBoyService = new DeliveryBoy();
    }

    async AddDeliveryBoy(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.deliveryBoyService.AddDeliveryBoy(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async uploadFile(req, res) {
        try {
            let result = await this.deliveryBoyService.uploadFile(req.files.deliveryBoyFile);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateDeliveryBoy(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.deliveryBoyService.updateDeliveryBoy(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteDeliveryBoy(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.deliveryBoyService.deleteDeliveryBoy(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getDeliveryBoyByAdmin(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id
        };
        try {
            let result = await this.deliveryBoyService.getDeliveryBoyByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deliveryBoyAction(req, res) {
        try {
            let result = await this.deliveryBoyService.deliveryBoyAction({
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

module.exports.DeliveryBoyController = DeliveryBoyController;
