const bcrypt = require("bcrypt-nodejs");
const crypto = require('crypto');
var log = require("../logger/winston").LOG;
const User = require('../database/models/user');
const Merchant = require('../database/models/merchant');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
var config = require('../../config');
const XLSX = require('xlsx');
const MerchantCategory = require('../database/models/merchant-category');
const MerchantItem = require('../database/models/merchant-item');

class MerchantService {
    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async AddMerchant(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.phone || isNaN(request.phone) || !request.name || !request.pinCode || !request.mapLocation) {
                    return reject(errorFactory.invalidRequest(message.MISSING_INFORMATION));
                }

                resolve(await Merchant.updateOne({user: request.owner, isDeleted: false}, {
                    $set: {
                        user: request.owner,
                        name: request.name.toLowerCase().trim(),
                        phone: request.phone,
                        pinCode: request.pinCode,
                        isDeleted: false,
                        mapLocation: request.mapLocation,
                        area: request.area,
                        shopName: request.shopName,
                        houseNo: request.houseNo,
                        landmark: request.landmark,
                        state: request.state || "RAJASTHAN",
                        city: request.city,
                        country: request.country || "INDIA",
                        createdBy: request.owner
                    }
                }, {upsert: true}));

            } catch (error) {
                log.error("AddMerchant-->catch", error);
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
                        request["name"] = data.merchantName;
                        let id = await this.AddMerchant(request);
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
     * update merchant
     * @returns {Promise<void>}
     * @param request
     */
    async updateMerchant(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let merchant = {
                        modifiedBy: request.owner
                    };
                    if (request.name) merchant["name"] = request.name.toLowerCase().trim();
                    if (request.phone) merchant["phone"] = request.phone;
                    if (request.pinCode) merchant["pinCode"] = parseInt(request.pinCode);
                    if (request.mapLocation) merchant["mapLocation"] = request.mapLocation;
                    if (request.area) merchant["area"] = request.area;
                    if (request.landmark) merchant["landmark"] = request.landmark;
                    if (request.state) merchant["state"] = request.state;
                    if (request.city) merchant["city"] = request.city;
                    if (request.status) merchant["status"] = request.status;
                    if (request.country) merchant["country"] = request.country;
                    if (request.shopName) merchant["shopName"] = request.shopName;


                    if (request.pinCode) {
                        await MerchantCategory.update({merchant: request.id},
                            {
                                $set: {
                                    modifiedBy: request.owner,
                                    pinCode: request.pinCode,
                                    modifiedAt: new Date()
                                }
                            },
                            {multi: true}
                        );

                        await MerchantItem.update({merchant: request.id},
                            {
                                $set: {
                                    modifiedBy: request.owner,
                                    pinCode: request.pinCode,
                                    modifiedAt: new Date()
                                }
                            },
                            {multi: true}
                        );
                    }
                    resolve(await Merchant.updateOne({_id: request.id}, {$set: merchant}, {upsert: true}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("MerchantService-->, updateMerchant  --->  catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * we are getting all user
     * @param data
     */
    async sendFinalItemOrderToMerchant(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    console.log("Data", data);
                    resolve(true);
                } catch
                    (error) {
                    log.error("MerchantService-->getMerchantByAdmin-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        );
    }

    /**
     * we are getting all user
     * @param data
     */
    async getMerchantByAdmin(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await Merchant.findOne({_id: data.id});
                        resolve(result)
                    } else if (data.user) {
                        let result = await Merchant.findOne({user: data.user, isDeleted: false});
                        resolve(result)
                    } else {
                        let query = {};
                        if (data.searchText) {
                            query["$text"] = {"$search": data.searchText};
                        }
                        const count = await Merchant.find(query).countDocuments();
                        let result = await Merchant.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: result})
                    }
                } catch
                    (error) {
                    log.error("MerchantService-->getMerchantByAdmin-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        );
    }

    async merchantAction(req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.id && req.action && config.userAction.hasOwnProperty(req.action)) {
                    let merchant = await Merchant.findOne({_id: req.id});
                    if (merchant) {
                        await Merchant.updateOne({_id: req.id}, {
                            $set: {
                                isDeleted: config.userAction[req.action],
                                modifiedBy: req.owner
                            }
                        });
                        await MerchantCategory.update({merchant: req.id},
                            {
                                $set: {
                                    isDeleted: config.userAction[req.action],
                                    modifiedBy: req.owner,
                                    modifiedAt: new Date()
                                }
                            },
                            {multi: true}
                        );

                        await MerchantItem.update({merchant: req.id},
                            {
                                $set: {
                                    isDeleted: config.userAction[req.action],
                                    modifiedBy: req.owner,
                                    modifiedAt: new Date()
                                }
                            },
                            {multi: true}
                        );
                        await User.update({_id: merchant.user}, {
                                $set: {
                                    isDeleted: config.userAction[req.action],
                                    modifiedBy: req.owner,
                                    modifiedAt: new Date()
                                }
                            },
                            {multi: true});
                        resolve(true);
                    } else {
                        reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                    }


                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
                }
            } catch (error) {
                log.error("MerchantService-->merchantAction-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    };


    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     */
    async deleteMerchant(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let merchant = await Merchant.findOne({_id: request.id});
                    if (merchant) {
                        await Merchant.remove({_id: request.id});
                        await MerchantCategory.remove({merchant: request.id});
                        await MerchantItem.remove({merchant: request.id});
                        await User.remove({_id: merchant.user});
                        resolve(true);
                    } else {
                        reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                    }

                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("MerchantService-->deleteCategory-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.MerchantService = MerchantService;
