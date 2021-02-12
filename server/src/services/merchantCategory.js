const log = require("../logger/winston").LOG;
const MerchantCategory = require('../database/models/merchant-category');
const MerchantItem = require('../database/models/merchant-item');
const Item = require('../database/models/item');
const Category = require('../database/models/category');
const Merchant = require('../database/models/merchant');
const errorFactory = require("../errorFactory/error-factory");
const HelperService = require('./helper').HelperService;

class MerchantCategoryService {
    /**
     * MerchantCategoryService addMerchantCategory
     * @returns {Promise<void>}
     * @param request
     */
    async addMerchantCategories(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!(request.category && request.category.length) || !request.merchantId) {
                    return reject(errorFactory.invalidRequest("Invalid Categories"));
                }
                let merchant = await Merchant.findOne({_id: request.merchantId, isDeleted: false});
                if (!merchant) {
                    return reject(errorFactory.invalidRequest("Invalid merchant"));
                }
                for (let index = 0; index < request.category.length; index++) {
                    await this.addMerchantCategory({category: request.category[index], owner: request.owner}, merchant)
                }
                resolve(true);

            } catch (error) {
                log.error("MerchantCategoryService-->addMerchantCategories-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * MerchantCategoryService addMerchantCategory
     * @returns {Promise<void>}
     * @param data
     * @param merchant
     */
    async addMerchantCategory(data, merchant) {
        return new Promise(async (resolve, reject) => {
            try {
                let item = await Item.find({category: data.category, isDeleted: false});
                if (item && item.length) {

                    let result = await MerchantCategory.findOne({
                        merchant: merchant._id,
                        category: data.category
                    });
                    if (!result) {
                        result = await new MerchantCategory({
                            merchant: merchant._id,
                            category: data.category,
                            pinCode: merchant.pinCode,
                            createdBy: data.owner,
                            modifiedBy: data.owner
                        }).save();
                    }
                    for (let index = 0; index < item.length; index++) {
                        let item =
                            await this.addMerchantItem({
                                merchant: merchant._id,
                                category: data.category,
                                pinCode: merchant.pinCode,
                                merchantCategory: result._id,
                                createdBy: data.owner,
                                item: item[index]._id,
                                price: item[index].price,
                                modifiedBy: data.owner
                            })
                    }

                    resolve();

                } else {
                    resolve();
                }


            } catch (error) {
                log.error("MerchantCategoryService-->addMerchantCategory-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    async addMerchantItem(data) {
        return new Promise(async (resolve, reject) => {
            try {

                let result = await MerchantItem.findOne({
                    merchant: data.merchant,
                    item: data.item,
                    category: data.category
                });
                if (!result) {
                    result = await new MerchantItem(data).save();
                }

                resolve(result);


            } catch (error) {
                log.error("MerchantCategoryService-->addMerchantItem-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    /**
     * we are getting all user
     * @param data
     */
    async getMerchantCategory(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data.id) {
                    let result = await Category.findOne({_id: data.id, isDeleted: false});
                    resolve(HelperService.prototype.createCategoryImage([result]))
                } else {
                    let query = {isDeleted: false};
                    if (data.searchText) {
                        query["$or"] = [{name: new RegExp('^' + data.searchText, "i")}, {description: new RegExp('^' + data.searchText, "i")}];
                    }
                    const ids = await MerchantCategory.find({
                        isDeleted: false,
                        pinCode: data.pinCode
                    }).distinct('category');
                    query["_id"] = {$in: ids};
                    let result = await Category.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                    resolve({total: ids.length, records: HelperService.prototype.createCategoryImage(result)})
                }

            } catch (error) {
                log.error("MerchantCategoryService-->getMerchantCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    /**
     * we are getUnselectedMerchantCategory all user
     * @param data
     */
    async getUnselectedMerchantCategory(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const ids = [];
                const query = {
                    isDeleted: false
                };
                let merchantCategoryData = await MerchantCategory.find({merchant: data.merchantId}, {category: 1});
                for (let index = 0; index < merchantCategoryData.length; index++) {
                    ids.push(merchantCategoryData[index].category);
                }
                if (ids && ids.length) {
                    query["_id"] = {$nin: ids}
                }
                if (data.searchText) {
                    query["$text"] = {"$search": data.searchText};
                }
                const count = await Category.find(query).countDocuments();
                let result = await Category.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                resolve({total: count, records: HelperService.prototype.createCategoryImage(result)})
            } catch (error) {
                log.error("MerchantCategoryService-->getUnselectedMerchantCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }
        });
    }


    /**
     * we are getMerchantCategoryByAdmin all user
     * @param data
     */
    async getMerchantCategoryByAdmin(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = {};
                if (data.searchText) {
                    query["$text"] = {"$search": data.searchText};
                }
                if (data.merchantId) {
                    query["merchant"] = data.merchantId;
                }
                const count = await MerchantCategory.find(query).countDocuments();
                let result = await MerchantCategory.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit)).populate("category");
                resolve({total: count, records: HelperService.prototype.createMerchantCategorysImageByAdmin(result)})
            } catch (error) {
                log.error("MerchantCategoryService-->getMerchantCategoryByAdmin-->", error);
                reject(errorFactory.dataBaseError(error));
            }
        });
    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param data
     * @param owner
     */
    async updateMultipleCategory(data, owner) {
        return new Promise(async (resolve, reject) => {
            try {
                data.updatedRequest["modifiedBy"] = owner;
                data.updatedRequest["modifiedAt"] = new Date();
                let result = await MerchantCategory.update({_id: {$in: data.ids}, merchant: data.merchantId},
                    {$set: data.updatedRequest},
                    {multi: true}
                );
                resolve(result);

            } catch (error) {
                log.error("ItemService-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async deleteMerchantCategoryCategory(data) {
        return new Promise(async (resolve, reject) => {
            try {
                await MerchantCategory.remove({_id: {$in: data.ids}, merchant: data.merchantId});
                await MerchantItem.remove({merchantCategory: {$in: data.ids}, merchant: data.merchantId});
                resolve(true);
            } catch (error) {
                log.error("MerchantCategoryService-->deleteMerchantCategoryCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


}

module.exports.MerchantCategoryService = MerchantCategoryService;
