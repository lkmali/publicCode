var responseService = require('../middleware/response');
const MerchantCategory = require('../services').MerchantCategory;

class MerchantCategoryController {

    constructor() {
        this.merchantCategoryService = new MerchantCategory();
    }

    async addMerchantCategoriesByAdmin(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.merchantCategoryService.addMerchantCategories(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async addMerchantCategoriesByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantCategoryService.addMerchantCategories(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async updateMerchantCategoriesByAdmin(req, res) {
        try {
            let result = await this.merchantCategoryService.updateMultipleCategory(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateMerchantCategoriesByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantCategoryService.updateMultipleCategory(req.body, req.user.id);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async deleteMerchantCategoriesByAdmin(req, res) {
        try {
            let result = await this.merchantCategoryService.deleteMerchantCategoryCategory(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteMerchantCategoriesByMerchant(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["merchantId"] = req.user.merchantId;
            let result = await this.merchantCategoryService.deleteMerchantCategoryCategory(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getMerchantCategoriesByAdmin(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                merchantId: req.query.merchantId

            };
            let result = await this.merchantCategoryService.getMerchantCategoryByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantCategoriesByMerchant(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null

            };
            data["owner"] = req.user.id;
            data["merchantId"] = req.user.merchantId;
            let result = await this.merchantCategoryService.getMerchantCategoryByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getUnselectedMerchantCategoriesByAdmin(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                merchantId: req.query.merchantId,
                category: req.query.category

            };
            let result = await this.merchantCategoryService.getUnselectedMerchantCategory(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }


    async getUnselectedMerchantCategoriesByMerchant(req, res) {
        try {
            let data = {
                offset: req.query.offset || 0,
                limit: req.query.limit || 20,
                searchText: req.query.searchText || null,
                category: req.query.category

            };
            data["owner"] = req.user.id;
            data["merchantId"] = req.user.merchantId;
            let result = await this.merchantCategoryService.getUnselectedMerchantCategory(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getMerchantCategory(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            pinCode: req.query.pinCode

        };
        try {
            let result = await this.merchantCategoryService.getMerchantCategory(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.MerchantCategoryController = MerchantCategoryController;
