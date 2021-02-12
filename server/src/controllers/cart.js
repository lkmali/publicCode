var responseService = require('../middleware/response');
const Cart = require('../services').Cart;
const Helper = require('../services').Helper;

class CartController {

    constructor() {
        this.cartService = new Cart();
    }

    async addCart(req, res) {
        try {
            req.body["CartData"] = Helper.prototype.getCartObject({
                owner: req.user.id || null,
                guest: req.user.guest || null,
            });
            req.body["owner"] = req.user.id || req.user.guest;
            req.body["guest"] = req.user.guest;
            let result = await this.cartService.addCart(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getCart(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            id: req.query.id,
            item: req.query.item
        };
        data["CartData"] = Helper.prototype.getCartObject({
            owner: req.user.id || null,
            guest: req.user.guest || null,
        });
        data["owner"] = req.user.id || req.user.guest;
        try {
            let result = await this.cartService.getCart(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async transferCartData(req, res) {
        try {
            let result = await this.cartService.transferCartData({
                guest: req.user.guest,
                owner: req.user.id || null
            });

            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.CartController = CartController;
