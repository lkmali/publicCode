var log = require("../logger/winston").LOG;
const Item = require('../database/models/item');
const OfferImage = require('../database/models/offer-Image');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
const HelperService = require('./helper').HelperService;
const fcmService = require('./fcm').FcmService;
var config = require('../../config');

class OfferImageService {
    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     */
    async addOfferImage(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = {};
                if (!request.id && !(request.files && request.files["preview"])) {
                    return reject(errorFactory.invalidRequest("offer Image  require"));
                }
                let offerRequest = {
                    createdBy: request.owner,
                    description: request.description || "",
                    title: request.title
                };
                if (request.files && request.files["preview"]) {
                    offerRequest["preview"] = await HelperService.prototype.getImageBase64(request.files, "preview");
                }

                if (request.item) {
                    let item = await Item.findOne({_id: request.item, isDeleted: false});
                    if (!item) {
                        return reject(errorFactory.invalidRequest("Item not found ot unavailable"));
                    }
                    offerRequest['item'] = item._id;
                    offerRequest['itemName'] = item.name;
                    query["item"] = item._id;
                }
                let offerImage = null;
                if (request.id) {
                    query["_id"] = request.id;
                }

                offerImage = await OfferImage.findOne(query);
                if (offerImage) {
                    offerImage["createdBy"] = offerRequest.createdBy;
                    offerImage["description"] = offerRequest.description;
                    offerImage["title"] = offerRequest.title;
                    offerImage["preview"] = offerRequest.preview || offerImage["preview"];
                    if (offerRequest.item) {
                        offerImage["item"] = offerRequest.item;
                        offerImage["itemName"] = offerRequest.itemName;
                    }
                } else {
                    offerImage = new OfferImage(offerRequest);
                }
                let saveData = await offerImage.save();
                fcmService.prototype.sendOfferImageNotification({
                    body: saveData["description"],
                    title: saveData.title,
                    type: "OFFER_RECEIVE",
                    event: "OFFER_RECEIVE",
                    "targetIntent": "OfferList",
                    bannerImage: config.web + "/api/product/image/offerImage/offerImagePreview/" + saveData._id.toString() + "?" + Date.now(),
                    itemId: saveData.item.toString(),
                });
                resolve(true);
            } catch (error) {
                log.error("OfferImageService--->addOfferImage-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * we are getting all user
     * @param data
     */
    async getOfferImage(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await OfferImage.findOne({_id: data.id, isDeleted: false});
                        resolve(HelperService.prototype.createOfferImage(result));
                    } else if (data.item) {
                        let result = await OfferImage.findOne({_id: data.item, isDeleted: false});
                        resolve(HelperService.prototype.createOfferImage(result));
                    } else {

                        let query = {isDeleted: false};
                        const count = await OfferImage.find(query).countDocuments();
                        let result = await OfferImage.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: HelperService.prototype.createOfferImages(result)})
                    }
                } catch
                    (error) {
                    log.error("OfferImageService-->getOfferImage-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        )
            ;
    }


    /**
     * we are getting all user
     * @param data
     */
    async getOfferImageByAdmin(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await OfferImage.findOne({_id: data.id});
                        if (result) {
                            resolve(HelperService.prototype.createOfferImage(result));
                        } else {
                            resolve({});
                        }
                    } else if (data.item) {
                        let result = await OfferImage.findOne({item: data.item});
                        if (result) {
                            resolve(HelperService.prototype.createOfferImage(result));
                        } else {
                            resolve({});
                        }


                    } else {

                        let query = {};
                        const count = await OfferImage.find(query).countDocuments();
                        let result = await OfferImage.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: HelperService.prototype.createOfferImages(result)})
                    }
                } catch
                    (error) {
                    log.error("OfferImageService-->getOfferImageByAdmin-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        )
    }

    async OfferImageAction(req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.id && req.action && config.userAction.hasOwnProperty(req.action)) {
                    resolve(await OfferImage.updateOne({_id: req.id}, {
                        $set: {
                            isDeleted: config.userAction[req.action],
                            modifiedBy: req.owner
                        }
                    }));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
                }
            } catch (error) {
                log.error("OfferImageService-->OfferImageAction-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     */
    async deleteOfferImage(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    resolve(await OfferImage.remove({_id: request.id}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("OfferImageService-->deleteOfferImage-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.OfferImageService = OfferImageService;