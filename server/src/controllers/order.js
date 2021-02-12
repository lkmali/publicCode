var responseService = require('../middleware/response');
const Order = require('../services').Order;


class OrderController {

    constructor() {
        this.orderService = new Order();
    }

    async createOrder(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.orderService.createOrder(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateOrder(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["orderId"] = req.params.id;
            let result = await this.orderService.updateOrder(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async cancelOrderStatus(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["orderId"] = req.params.id;
            let result = await this.orderService.cancelOrderStatus(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async reOrder(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["orderId"] = req.params.id;
            let result = await this.orderService.reOrder(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getAdminOrder(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            id: req.query.id,
            status: req.query.status,
            owner: req.user.id
        };
        try {
            let result = await this.orderService.getAdminOrder(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async downloadOrderInvoice(req, res) {
        let data = {
            orderId: req.params.orderId,
            owner: req.user.id
        };
        try {
            let result = await this.orderService.downloadOrderInvoice(data, res);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async downloadAdminOrderInvoice(req, res) {
        let data = {
            orderId: req.params.orderId,
            owner: req.user.id
        };
        try {
            let result = await this.orderService.downloadAdminOrderInvoice(data, res);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async changeOrderStatus(req, res) {
        try {
            req.body["id"] = req.params.id;
            let result = await this.orderService.changeOrderStatus(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getOrder(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            id: req.query.id,
            status: req.query.status,
            owner: req.user.id
        };
        try {
            let result = await this.orderService.getOrder(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.OrderController = OrderController;
