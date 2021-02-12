var responseService = require('../middleware/response');
const Item = require('../services').Item;
const Helper = require('../services').Helper;
const MerchantItem = require('../services').MerchantItem;

class ItemController {

    constructor() {
        this.itemService = new Item();
        this.merchanService = new MerchantItem();
    }

    async add(req, res) {
        try {
            req.body["files"] = req.files;
            req.body["owner"] = req.user.id;
            let result = await this.itemService.add(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async update(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["files"] = req.files;
            req.body["id"] = req.params.id;
            let result = await this.itemService.update(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMultipleItem(req, res) {
        try {
            let result = await this.itemService.updateMultipleItem(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async addItemImages(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["files"] = req.files;
            req.body["id"] = req.params.id;
            let result = await this.itemService.addItemImages(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteItem(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.itemService.deleteItem(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async imageStream(req, res) {
        try {
            let data = {
                type: req.params.type,
                imageType: req.params.imageType,
                id: req.params.id
            };
            let result = await this.itemService.imageSteam(data, res);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getItemByAdmin(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id,
            categoryId: req.query.categoryId

        };

        try {
            let result = await this.itemService.getItemByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getItem(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id,
            categoryId: req.query.categoryId,
            pinCode: req.query.pinCode

        };
        data["CartData"] = Helper.prototype.getCartObject({
            owner: req.user.id || null,
            guest: req.user.guest || null,
        });
        data["owner"] = req.user.id || req.user.guest;
        try {
            let result = await this.merchanService.getMerchantItem(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async itemAction(req, res) {
        try {
            let result = await this.itemService.itemAction({
                id: req.body.id,
                action: req.params.action,
                owner: req.user.id
            });
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async stockAction(req, res) {
        try {
            let result = await this.itemService.stockAction({
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

module.exports.ItemController = ItemController;
