const log = require("../logger/winston").LOG;
const MerchantItem = require('../database/models/merchant-item');
const MerchantCategory = require('../database/models/merchant-category');
const errorFactory = require("../errorFactory/error-factory");
const HelperService = require('./helper').HelperService;
const Merchant = require('../database/models/merchant');
const Item = require('../database/models/item');
const Cart = require('../database/models/cart');
const GuestCart = require('../database/models/guest-cart');

class MerchantItemService {


    /**
     * MerchantItemService addMerchantItem
     * @returns {Promise<void>}
     * @param request
     */
    async addMerchantItems(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!(request.items && request.items.length) || !request.merchantId) {
                    return reject(errorFactory.invalidRequest("Invalid items"));
                }
                let merchant = await Merchant.findOne({_id: request.merchantId, isDeleted: false});
                if (!merchant) {
                    return reject(errorFactory.invalidRequest("Invalid merchant"));
                }
                for (let index = 0; index < request.items.length; index++) {
                    await this.addMerchantItem({
                        item: request.items[index],
                        owner: request.owner
                    }, merchant)
                }
                resolve(true);

            } catch (error) {
                log.error("MerchantItemService-->addMerchantItems-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * MerchantItemService addMerchantItem
     * @returns {Promise<void>}
     * @param data
     * @param merchant
     */
    async addMerchantItem(data, merchant) {
        return new Promise(async (resolve, reject) => {
            try {
                let item = await Item.findOne({_id: data.item, isDeleted: false});
                if (item) {
                    let result = await MerchantCategory.findOne({
                        merchant: merchant._id,
                        category: item.category
                    });
                    if (!result) {
                        result = await new MerchantCategory({
                            merchant: merchant._id,
                            category: item.category,
                            pinCode: merchant.pinCode,
                            createdBy: data.owner,
                            modifiedBy: data.owner
                        }).save();
                    }
                    resolve(await this.addItem({
                        merchant: merchant._id,
                        category: item.category,
                        pinCode: merchant.pinCode,
                        merchantCategory: result._id,
                        createdBy: data.owner,
                        item: item._id,
                        price: data.price || item.price,
                        modifiedBy: data.owner
                    }));
                } else {
                    resolve();
                }


            } catch (error) {
                log.error("MerchantItemService-->addMerchantItem-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    async addItem(data) {
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
                log.error("MerchantItemService-->addItem-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * we are getting all user
     * @param data
     */
    async getMerchantItem(data) {
        return new Promise(async (resolve, reject) => {
            try {

                if (data.id) {
                    let result = await Item.findOne({_id: data.id, isDeleted: false});
                    if (result) {
                        let cart = await data.CartData.find({
                            item: result._id,
                            isDeleted: false,
                            user: data.owner,
                            status: "PENDING"
                        });

                        resolve(HelperService.prototype.createItemImage(result, cart));
                    } else {
                        resolve({});
                    }

                } else {
                    let query = {isDeleted: false};
                    let itemQuery = {isDeleted: false};
                    if (data.searchText) {
                        itemQuery["$or"] = [{name: new RegExp('^' + data.searchText, "i")}, {description: new RegExp('^' + data.searchText, "i")}];
                    }
                    if (data.pinCode) {
                        query["pinCode"] = data.pinCode;
                    }
                    if (data.categoryId) {
                        query["category"] = data.categoryId;
                        itemQuery["category"] = data.categoryId;
                    }
                    const ids = await MerchantItem.find(query).distinct('item');

                    itemQuery["_id"] = {$in: ids};
                    let result = await Item.find(itemQuery).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                    resolve({
                        total: ids.length,
                        records: await HelperService.prototype.createItemsImage(result, data.CartData, data.owner)
                    })
                }

            } catch (error) {
                log.error("MerchantItemService-->getMerchantItem-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    /**
     * we are getMerchantCategoryByAdmin all user
     * @param data
     */
    async getUnselectedMerchantItem(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const ids = [];
                const query = {
                    isDeleted: false
                };
                let itemQuery = {isDeleted: false};
                let merchantCategoryData = await MerchantItem.find({merchant: data.merchantId}, {item: 1});
                for (let index = 0; index < merchantCategoryData.length; index++) {
                    ids.push(merchantCategoryData[index].item);
                }
                if (ids && ids.length) {
                    query["_id"] = {$nin: ids};
                }
                if (data.category) {
                    query["category"] = data.category;
                }
                if (data.searchText) {
                    query["$text"] = {"$search": data.searchText};
                }
                const count = await Item.find(query).countDocuments();
                let result = await Item.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                resolve({total: count, records: await HelperService.prototype.createItemsImage(result)})
            } catch (error) {
                log.error("MerchantItemService-->getUnselectedMerchantItem-->", error);
                reject(errorFactory.dataBaseError(error));
            }
        });
    }

    /**
     * we are getMerchantItemByAdmin all user
     * @param data
     */
    async getMerchantItemByAdmin(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let query = {};
                if (data.searchText) {
                    query["$text"] = {"$search": data.searchText};
                }
                if (data.pinCode) {
                    query["pinCode"] = data.pinCode;
                }
                if (data.merchantCategory) {
                    query["merchantCategory"] = data.merchantCategory;
                }
                if (data.category) {
                    query["category"] = data.category;
                }
                query["merchant"] = data.merchantId;
                const count = await MerchantItem.find(query).countDocuments();
                let result = await MerchantItem.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit)).populate("item");
                resolve({total: count, records: HelperService.prototype.createMerchantItemsImageByAdmin(result)})
            } catch (error) {
                log.error("MerchantItemService-->getMerchantItemByAdmin-->", error);
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
    async updateMultipleItem(data, owner) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data.updatedRequest.hasOwnProperty("price")) {
                    return reject(errorFactory.invalidRequest("Invalid update Request"));
                }
                data.updatedRequest["modifiedBy"] = owner;
                data.updatedRequest["modifiedAt"] = new Date();
                let result = await MerchantItem.update({_id: {$in: data.ids}, merchant: data.merchantId},
                    {$set: data.updatedRequest},
                    {multi: true}
                );
                resolve(result);

            } catch (error) {
                log.error("MerchantItemService-->updateMultipleItem-->", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param data
     * @param owner
     */
    async updateMerchantItemPrice(data, owner) {
        return new Promise(async (resolve, reject) => {
            try {

                if (!data.merchantItem || !data.price || !data.merchantId) {
                    return reject(errorFactory.invalidRequest("Invalid update Request"));
                }
                let merchantItems = await MerchantItem.findOne({
                    _id: data.merchantItem,
                    merchant: data.merchantId
                }).populate("item");

                if (merchantItems.item.price < data.price) {
                    return reject(errorFactory.invalidRequest("Invalid update Request"));
                }
                merchantItems["price"] = data.price;
                merchantItems["modifiedBy"] = owner;
                merchantItems["modifiedAt"] = new Date();
                resolve(await merchantItems.save());
            } catch (error) {
                log.error("updateMerchantItemPrice-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    async deleteMerchantItem(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await MerchantItem.remove({_id: {$in: data.ids}, merchant: data.merchantId});
                resolve(result);
            } catch (error) {
                log.error("MerchantItemService-->deleteMerchantItemCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }
}

module.exports.MerchantItemService = MerchantItemService;
