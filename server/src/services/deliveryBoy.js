const bcrypt = require("bcrypt-nodejs");
const crypto = require('crypto');
var log = require("../logger/winston").LOG;
const User = require('../database/models/user');
const DeliveryBoy = require('../database/models/delivery-boy');
const Fcm = require('../database/models/fcm');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
var config = require('../../config');
const XLSX = require('xlsx');

class DeliveryBoyService {
    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async AddDeliveryBoy(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.phone || isNaN(request.phone) || !request.name || !request.pinCode || !request.mapLocation) {
                    return reject(errorFactory.invalidRequest(message.MISSING_INFORMATION));
                }
                resolve(await DeliveryBoy.updateOne({user: request.owner, isDeleted: false}, {
                    $set: {
                        user: request.owner,
                        name: request.name.toLowerCase().trim(),
                        phone: request.phone,
                        pinCode: request.pinCode,
                        mapLocation: request.mapLocation,
                        area: request.area,
                        landmark: request.landmark,
                        isDeleted: false,
                        state: request.state || "RAJASTHAN",
                        city: request.city,
                        country: request.country || "INDIA",
                        createdBy: request.owner
                    }
                }, {upsert: true}));


            } catch (error) {
                log.error("register-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    /**
     * category add
     * @returns {Promise<void>}
     * @param files
     */
    async uploadFile(files) {
        return new Promise(async (resolve, reject) => {
            try {
                const workSheetsFromBuffer = XLSX.read(files.data, {raw: true});
                if (workSheetsFromBuffer && workSheetsFromBuffer.SheetNames && workSheetsFromBuffer.SheetNames.length) {
                    const sheetName = workSheetsFromBuffer.SheetNames[0];
                    const sheet = workSheetsFromBuffer.Sheets[sheetName];
                    const data = XLSX.utils.sheet_to_json(sheet);
                    resolve(await this.processJsonProductData(data))
                } else {
                    return reject(errorFactory.invalidRequest("Invalid file"));
                }
            } catch (error) {
                log.error("DeliveryBoyService-->uploadFile-->catch", error);
                return reject(errorFactory.invalidRequest("Invalid file"));
            }
        });

    }

    async processJsonProductData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data && data.length) {
                    for (let index = 0; index < data.length; index++) {
                        let request = data;
                        request["name"] = data.deliveryBoyName;
                        let id = await this.AddDeliveryBoy(request);
                    }
                    resolve(true);
                } else {
                    return reject(errorFactory.invalidRequest("Empty file"));
                }

            } catch (error) {
                log.error("DeliveryBoyService--->processJsonProductData-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * update deliveryBoy
     * @returns {Promise<void>}
     * @param request
     */
    async updateDeliveryBoy(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let deliveryBoy = {
                        modifiedBy: request.owner
                    };
                    if (request.name) deliveryBoy["name"] = request.name.toLowerCase().trim();
                    if (request.phone) deliveryBoy["phone"] = request.phone;
                    if (request.pinCode) deliveryBoy["pinCode"] = parseInt(request.pinCode);
                    if (request.mapLocation) deliveryBoy["mapLocation"] = request.mapLocation;
                    if (request.area) deliveryBoy["area"] = request.area;
                    if (request.landmark) deliveryBoy["landmark"] = request.landmark;
                    if (request.state) deliveryBoy["state"] = request.state;
                    if (request.city) deliveryBoy["city"] = request.city;
                    if (request.status) deliveryBoy["status"] = request.status;
                    if (request.country) deliveryBoy["country"] = request.country;
                    resolve(await DeliveryBoy.updateOne({_id: request.id}, {$set: deliveryBoy}, {upsert: true}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("DeliveryBoyService-->, updateDeliveryBoy  --->  catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    /**
     * we are getting all user
     * @param data
     */
    async getDeliveryBoyByAdmin(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await DeliveryBoy.findOne({_id: data.id});
                        resolve(result)
                    } else if (data.user) {
                        let result = await DeliveryBoy.findOne({user: data.user, isDeleted: false});
                        resolve(result)
                    } else {

                        let query = {};
                        if (data.searchText) {
                            query["$text"] = {"$search": data.searchText};
                        }
                        const count = await DeliveryBoy.find(query).countDocuments();
                        let result = await DeliveryBoy.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: result})
                    }
                } catch
                    (error) {
                    log.error("DeliveryBoyService-->getDeliveryBoyByAdmin-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        );
    }

    async deliveryBoyAction(req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.id && req.action && config.userAction.hasOwnProperty(req.action)) {
                    resolve(await DeliveryBoy.updateOne({_id: req.id}, {
                        $set: {
                            isDeleted: config.userAction[req.action],
                            modifiedBy: req.owner
                        }
                    }));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
                }
            } catch (error) {
                log.error("DeliveryBoyService-->deliveryBoyAction-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    };


    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     */
    async deleteDeliveryBoy(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let category = {
                        modifiedBy: request.owner,
                        isDeleted: true
                    };
                    resolve(await DeliveryBoy.remove({_id: request.id}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("DeliveryBoyService-->deleteCategory-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.DeliveryBoyService = DeliveryBoyService;
