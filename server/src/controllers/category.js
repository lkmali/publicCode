var responseService = require('../middleware/response');
const MerchantCategory = require('../services').MerchantCategory;
const Category = require('../services').Category;

class CategoryController {

    constructor() {
        this.categoryService = new Category();
        this.merchantCategoryService = new MerchantCategory();
    }

    async add(req, res) {
        try {
            req.body["files"] = req.files;
            req.body["owner"] = req.user.id;
            let result = await this.categoryService.add(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async uploadFile(req, res) {
        try {
            let result = await this.categoryService.uploadFile(req.files.categoryFile);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async update(req, res) {
        try {
            req.body["files"] = req.files;
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.categoryService.update(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteCategory(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.categoryService.deleteCategory(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getCategory(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id,
            pinCode: req.query.pinCode
        };
        try {
            let result = await this.merchantCategoryService.getMerchantCategory(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getCategoryByAdmin(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id
        };
        try {
            let result = await this.categoryService.getCategoryByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async categoryAction(req, res) {
        try {
            let result = await this.categoryService.CategoryAction({
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

module.exports.CategoryController = CategoryController;
