var log = require("../logger/winston").LOG;
const Item = require('../database/models/item');
const Cart = require('../database/models/cart');
const OfferImage = require('../database/models/offer-Image');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
const HelperService = require('./helper').HelperService;
const Category = require('../database/models/category');
var config = require('../../config');

class ItemService {
    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     */
    async add(request) {
        return new Promise(async (resolve, reject) => {
            try {
                var property = [{
                    quantity: request.quantity,
                    price: request.price,
                    actualPrice: request.price,
                    discount: 0
                }];
                if (request.property && request.property.length) {
                    property = request.property;
                }
                let newItem = new Item(
                    {
                        name: request.name,
                        price: request.price,
                        status: "active",
                        hsnCode: request.hsnCode,
                        unit: request.unit,
                        quantity: request.quantity,
                        gst: parseInt(request.gst),
                        currency: request.currency,
                        brand: request.brand,
                        description: request.description,
                        images: {},
                        property: property,
                        category: request.category,
                        preview: await HelperService.prototype.getImageBase64(request.files, "preview"),
                    }
                );
                let result = await newItem.save();
                HelperService.prototype.setItemShareLink({
                    "socialTitle": request.name,
                    "socialDescription": request.description,
                    "socialImageLink": `${config.web}/api/product/image/item/itemPreview/${result._id.toString()}?${Date.now()}   `
                }, result._id);
                resolve(result);
            } catch (error) {
                log.error("ItemService-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     */
    async addItemImages(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let item = await Item.findOne({_id: request.id});
                if (item) {
                    var updateImage = item.images;
                    for (let key in request.files) {
                        if (request.files.hasOwnProperty(key)) {
                            updateImage[key] = await HelperService.prototype.getImageBase64(request.files, key);
                        }
                    }
                    resolve(await Item.updateOne({_id: item.id}, {$set: {images: updateImage}})); // await Item.updateOne({_id: request.id}, {$set: images}));
                } else {
                    //log.error("ItemService-->catch", error);
                    return reject(errorFactory.invalidRequest("invalid item id"));
                }


            } catch (error) {
                log.error("ItemService-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     */
    async update(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.id) {
                    return reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
                var isChange = false;

                let itemData = await Item.findOne({_id: request.id});
                if (itemData.name != request.name || itemData.description != request.description) {
                    isChange = true;
                }
                itemData["modifiedBy"] = request.owner;
                if (request.unit) itemData["unit"] = request.unit;
                if (request.quantity) itemData["quantity"] = request.quantity;
                if (request.name) itemData["name"] = request.name.trim();
                if (request.hsnCode) itemData["hsnCode"] = request.hsnCode;
                if (request.gst) itemData["gst"] = parseInt(request.gst);
                if (request.property) itemData["property"] = request.property;
                if (request.price) itemData["price"] = request.price;
                if (request.currency) itemData["currency"] = request.currency;
                if (request.brand) itemData["brand"] = request.brand;
                if (request.description) itemData["description"] = request.description;
                if (request.status) itemData["status"] = request.status;
                if (request.category) itemData["category"] = request.category;
                if (request.files) {
                    itemData["preview"] = await HelperService.prototype.getImageBase64(request.files, "preview");
                    isChange = true;
                }

                var property = itemData["property"] || [{
                    quantity: itemData.quantity,
                    price: itemData.price,
                    actualPrice: itemData.price,
                    discount: 0
                }];
                for (let index = 0; index < property.length; index++) {
                    const price = (itemData.price * property[index].quantity) / itemData.quantity;
                    property[index].price = price - ((price * property[index].discount) / 100);
                    property[index].actualPrice = price;
                    if (property[index].quantity === itemData.quantity) {
                        property[index].price = itemData.price;
                        property[index].actualPrice = itemData.price;
                        property[index].discount = 0;
                    }
                }
                itemData["property"] = property;
                let result = await itemData.save();
                console.log("isChange", isChange);
                if (isChange) {
                    HelperService.prototype.setItemShareLink({
                        "socialTitle": itemData.name,
                        "socialDescription": itemData.description,
                        "socialImageLink": `${config.web}/api/product/image/item/itemPreview/${itemData._id.toString()}?${Date.now()}   `
                    }, itemData._id);
                }
                resolve(result);

            } catch (error) {
                log.error("ItemService-->catch", error);
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
    async updateMultipleItem(data, owner) {
        return new Promise(async (resolve, reject) => {
            try {
                data.updatedRequest["modifiedBy"] = owner;
                data.updatedRequest["modifiedAt"] = new Date();
                let result = await Item.update({_id: {$in: data.ids}},
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

    /**
     * we are getting all user
     * @param data
     */
    async getItem(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await Item.findOne({_id: data.id, isDeleted: false});
                        let cart = await Cart.find({
                            item: result._id,
                            isDeleted: false,
                            user: data.owner,
                            status: "PENDING"
                        });

                        resolve(HelperService.prototype.createItemImage(result, cart));
                    } else {

                        let query = {isDeleted: false};
                        if (data.searchText) {
                            query["$text"] = {"$search": data.searchText};
                        }
                        if (data.categoryId) {
                            query["category"] = data.categoryId;
                        }
                        const count = await Item.find(query).countDocuments();
                        let result = await Item.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: await HelperService.prototype.createItemsImage(result, data.owner)})
                    }
                } catch
                    (error) {
                    log.error("ItemService-->getItem-->", error);
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
    async getItemByAdmin(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await Item.findOne({_id: data.id});
                        resolve(HelperService.prototype.createItemImage(result))
                    } else {

                        let query = {};
                        if (data.searchText) {
                            query["$or"] = [{name: new RegExp('^' + data.searchText, "i")}, {description: new RegExp('^' + data.searchText, "i")}];
                        }
                        if (data.categoryId) {
                            query["category"] = data.categoryId;
                        }
                        const count = await Item.find(query).countDocuments();
                        let result = await Item.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: await HelperService.prototype.createItemsImage(result)})
                    }
                } catch (error) {
                    log.error("ItemService-->getItemByAdmin-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        )
            ;
    }

    /**
     * we are getting all user
     * @param id
     */
    async getCategory(id) {
        return Category.findOne({_id: id})
    }

    /**
     * we are getting all user
     * @param id
     */
    async getOfferImage(id) {
        return OfferImage.findOne({_id: id})
    }

    async itemAction(req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.id && req.action && config.userAction.hasOwnProperty(req.action)) {
                    resolve(await Item.updateOne({_id: req.id}, {
                        $set: {
                            isDeleted: config.userAction[req.action],
                            modifiedBy: req.owner
                        }
                    }));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
                }
            } catch (error) {
                log.error("CategoryService-->getCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    async stockAction(req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.id && req.action && ["AVAILABLE", "UN_AVAILABLE"].indexOf(req.action) >= 0) {
                    resolve(await Item.updateOne({_id: req.id}, {
                        $set: {
                            stock: req.action,
                            modifiedBy: req.owner
                        }
                    }));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
                }
            } catch (error) {
                log.error("CategoryService-->stockAction-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * we are getting all user
     * @param id
     */
    async getItemById(id) {
        return Item.findOne({_id: id})
    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     * @param res
     */
    async imageSteam(request, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let base64 = "";
                if (request.type === "category") {
                    let category = await this.getCategory(request.id);
                    base64 = category ? category.preview : "";
                } else if (request.type === "offerImage") {
                    let offerImage = await this.getOfferImage(request.id);
                    base64 = offerImage ? offerImage.preview : "";
                } else {
                    let item = await this.getItemById(request.id);
                    base64 = item && request.imageType === "itemPreview" ? item.preview : item.images[request.imageType];
                }
                const imgBuffer = Buffer.from(base64, 'base64');
                res.writeHead(200, {
                    'Cache-Control': 'max-age=3600, private',
                    'Content-Length': imgBuffer.length,
                    'Content-Type': 'image/png'
                });
                return res.end(imgBuffer);
            } catch (error) {
                return res.sendStatus(404);
            }
        });

    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     */
    async deleteItem(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let category = {
                        modifiedBy: request.owner,
                        isDeleted: true
                    };
                    resolve(await Item.updateOne({_id: request.id}, {$set: category}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("ItemService-->deleteCategory-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.ItemService = ItemService;