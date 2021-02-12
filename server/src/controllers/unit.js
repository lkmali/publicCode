var responseService = require('../middleware/response');
const Unit = require('../services').Unit;

class UnitController {

    constructor() {
        this.UnitService = new Unit();
    }

    async addUnit(req, res) {
        try {
            req.body["owner"] = req.user.id;
            let result = await this.UnitService.add(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteUnit(req, res) {
        try {
            let result = await this.UnitService.deleteUnit(req.params.name);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getUnit(req, res) {
        try {
            let result = await this.UnitService.getUnit();
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }
}

module.exports.UnitController = UnitController;
