var responseService = require('../middleware/response');
const Address = require('../services').Address;


class AddressController {

    constructor() {
        this.addressService = new Address();
    }

    async addAddress(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.addressService.addAddress(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async updateAddress(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.addressService.updateAddress(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteAddress(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.addressService.deleteAddress(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getAddress(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            id: req.query.id,
            owner: req.user.id
        };
        try {
            let result = await this.addressService.getAddressBook(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.AddressController = AddressController;
