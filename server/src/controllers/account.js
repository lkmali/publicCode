var jwt = new (require("../middleware/Jwt").Jwt)();
var responseService = require('../middleware/response');
const Account = require('../services').Account;

class AccountController {

    constructor() {
        this.accountService = new Account();
    }

    async sendOtp(req, res) {
        try {
            let result = await this.accountService.sendOtp(req.body);
            responseService.response(req, null, true, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async verifyMobileNo(req, res) {
        try {
            let data = await this.accountService.verifyMobileNo(req.body);
            data.token = jwt.generateToken({
                id: data.id,
                phone: data.phone,
                role: data.role
            });
            responseService.response(req, null, data, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateUser(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let data = await this.accountService.updateUser(req.body);
            data.token = jwt.generateToken({
                id: data.id,
                phone: data.phone,
                role: data.role
            });
            responseService.response(req, null, data, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getOrganizationUser(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            sortBy: req.query.sortBy || "createdAt",
            order: req.query.order || -1,
            searchText: req.query.searchText || null
        };
        try {
            let result = await this.accountService.getUsers(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async userAction(req, res) {
        try {
            let result = await this.accountService.UserAction({
                phone: req.body.phone,
                action: req.params.action,
                owner: req.user.id
            });
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteUser(req, res) {
        try {
            let result = await this.accountService.deleteUser({
                id: req.params.id,
                owner: req.user.id
            });
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateFcm(req, res) {
        try {
            req.body["owner"] = req.user.id || null;
            req.body["role"] = req.user.role || "user";
            req.body["guest"] = req.user.guest;
            let result = await this.accountService.UpdateFcmCode(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async addFcmToken(req, res) {
        try {
            req.body["owner"] = req.user.id || null;
            req.body["role"] = req.user.role || "user";
            req.body["guest"] = req.user.guest;
            let result = await this.accountService.addFcmToken(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.AccountController = AccountController;
