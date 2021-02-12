var responseService = require('../middleware/response');
const MerchantItem = require('../services').MerchantItem;

class MerchantItemController {

    constructor() {
        this.merchantItemService = new MerchantItem();
    }

    async addMerchantItemsByAdmin(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.merchantItemService.addMerchantItems(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async addMerchantItemsByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantItemService.addMerchantItems(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async updateMerchantItemsByAdmin(req, res) {
        try {
            let result = await this.merchantItemService.updateMultipleItem(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMerchantItemsByMerchant(req, res) {
        try {
            req.body["merchantId"] = req.user.id;
            let result = await this.merchantItemService.updateMultipleItem(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMerchantItemsPriceByAdmin(req, res) {
        try {
            let result = await this.merchantItemService.updateMerchantItemPrice(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMerchantItemsPriceByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantItemService.updateMerchantItemPrice(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async deleteMerchantItemsByAdmin(req, res) {
        try {
            let result = await this.merchantItemService.deleteMerchantItem(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteMerchantItemsByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantItemService.deleteMerchantItem(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getMerchantItemsByAdmin(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                merchantId: req.query.merchantId,
                category: req.query.categoryId,
                merchantCategory: req.query.merchantCategory

            };
            let result = await this.merchantItemService.getMerchantItemByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getUnselectedMerchantItemByAdmin(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                merchantId: req.query.merchantId,
                category: req.query.categoryId

            };

            let result = await this.merchantItemService.getUnselectedMerchantItem(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getUnselectedMerchantItemByMerchant(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                category: req.query.categoryId

            };
            data["owner"] = req.user.id;
            data["merchantId"] = req.user.merchantId;
            let result = await this.merchantItemService.getUnselectedMerchantItem(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantItemsByMerchant(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                category: req.query.categoryId,
                merchantCategory: req.query.merchantCategory

            };
            data["owner"] = req.user.id;
            data["merchantId"] = req.user.merchantId;
            let result = await this.merchantItemService.getMerchantItemByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getMerchantItem(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            pinCode: req.query.pinCode,
            categoryId: req.query.category

        };
        try {
            let result = await this.merchantItemService.getMerchantItem(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.MerchantItemController = MerchantItemController;
