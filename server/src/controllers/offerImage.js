var responseService = require('../middleware/response');
const OfferImage = require('../services').OfferImage;

class OfferImageController {

    constructor() {
        this.offerImageService = new OfferImage();
    }

    async addOfferImage(req, res) {
        try {
            req.body["files"] = req.files;
            req.body["owner"] = req.user.id;
            let result = await this.offerImageService.addOfferImage(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async deleteOfferImage(req, res) {
        try {
            req.body["owner"] = req.user.id;
            req.body["id"] = req.params.id;
            let result = await this.offerImageService.deleteOfferImage(req.body);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getOfferImageByAdmin(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            searchText: req.query.searchText || null,
            id: req.query.id,
            item: req.query.item

        };
        try {
            let result = await this.offerImageService.getOfferImageByAdmin(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async getOfferImage(req, res) {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            item: req.query.item,
            id: req.query.id

        };
        try {
            let result = await this.offerImageService.getOfferImage(data);
            responseService.response(req, null, result, res);
        } catch (error) {
            responseService.response(req, error, null, res);
        }
    }

    async offerImageAction(req, res) {
        try {
            let result = await this.offerImageService.OfferImageAction({
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

module.exports.OfferImageController = OfferImageController;
