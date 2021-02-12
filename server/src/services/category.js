var log = require("../logger/winston").LOG;
const Category = require('../database/models/category');
const Item = require('../database/models/item');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
const HelperService = require('./helper').HelperService;
const XLSX = require('xlsx');
var config = require('../../config');

class CategoryService {
    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     */
    async add(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let newCategory = new Category(
                    {
                        name: request.name,
                        description: request.description,
                        preview: await HelperService.prototype.getImageBase64(request.files, "preview")
                    }
                );
                resolve(await newCategory.save());
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
                log.error("uploadFile-->catch", error);
                return reject(errorFactory.invalidRequest("Invalid file"));
            }
        });

    }

    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     * @param index
     */
    async addFileCategory(request, index) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.categoryname) {
                    let data = await Category.findOne({name: request.categoryname.toLowerCase()});
                    if (data) {
                        resolve(data._id);
                    } else {
                        let newCategory = new Category(
                            {
                                name: request.categoryname,
                                description: request.categoryname
                            }
                        );
                        let result = await newCategory.save();
                        resolve(result._id);
                    }
                } else {
                    return reject(errorFactory.invalidRequest("categoryName require in line " + index));
                }
            } catch (error) {
                log.error("register-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     * @param categoryId
     * @param index
     */
    async addFileItem(request, categoryId, index) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.itemname && request.price) {
                    let itemRequest = {
                        name: request.itemname.toLowerCase(),
                        description: request.itemdescription || request.itemname,
                        price: request.price,
                        property: [],
                        isDeleted: true,
                        category: categoryId
                    };
                    delete request.itemname;
                    if (request.itemdescription) {
                        delete request.itemdescription
                    }
                    if (request.gst) {
                        itemRequest.gst = parseInt(request.gst);
                        delete request.gst
                    }
                    if (request.hsncode) {
                        itemRequest.hsnCode = request.hsncode;
                        delete request.hsncode
                    }
                    let result = await new Item(itemRequest).save();

                    HelperService.prototype.setItemShareLink({
                        "socialTitle": result.name,
                        "socialDescription": result.description,
                        "socialImageLink": `${config.web}/api/product/image/item/itemPreview/${result._id.toString()}?${Date.now()}   `
                    }, result._id);

                    resolve(result);
                } else {
                    return reject(errorFactory.invalidRequest("itemName or price require in line " + index));
                }

            } catch (error) {
                log.error("addFileItem-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async processJsonProductData(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data && data.length) {
                    for (let index = 0; index < data.length; index++) {
                        let request = {};
                        for (let key in data[index]) {
                            if (data[index].hasOwnProperty(key)) {
                                request[key.toLowerCase()] = data[index][key];
                            }
                        }
                        let id = await this.addFileCategory(request, index);
                        await this.addFileItem(request, id, index);
                    }
                    resolve(true);
                } else {
                    return reject(errorFactory.invalidRequest("Empty file"));
                }

            } catch (error) {
                log.error("processJsonProductData-->catch", error);
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
                if (request.id) {
                    let category = {
                        modifiedBy: request.owner
                    };
                    if (request.name) category["name"] = request.name;
                    if (request.description) category["description"] = request.description;
                    if (request.files) category["preview"] = await HelperService.prototype.getImageBase64(request.files, "preview");
                    resolve(await Category.updateOne({_id: request.id}, {$set: category}, {upsert: true}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("update-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * we are getting all user
     * @param data
     */
    async getCategory(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data.id) {
                    let result = await Category.findOne({_id: data.id, isDeleted: false});
                    resolve(HelperService.prototype.createCategoryImage([result]))
                } else {
                    let query = {isDeleted: false};
                    if (data.searchText) {
                        query = {"$text": {"$search": data.searchText}, isDeleted: false}
                    }
                    const count = await Category.find(query).countDocuments();
                    let result = await Category.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                    resolve({total: count, records: HelperService.prototype.createCategoryImage(result)})
                }


            } catch (error) {
                log.error("CategoryService-->getCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }


    /**
     * we are getting all user
     * @param data
     */
    async getCategoryByAdmin(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data.id) {
                    let result = await Category.findOne({_id: data.id});
                    resolve(HelperService.prototype.createCategoryImage([result]))
                } else {
                    let query = {};
                    if (data.searchText) {
                        query["$or"] = [{name: new RegExp('^' + data.searchText, "i")}, {description: new RegExp('^' + data.searchText, "i")}];
                    }
                    const count = await Category.find(query).countDocuments();
                    let result = await Category.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                    resolve({total: count, records: HelperService.prototype.createCategoryImage(result)})
                }


            } catch (error) {
                log.error("CategoryService-->getCategory-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    async CategoryAction(req) {
        return new Promise(async (resolve, reject) => {
            try {
                if (req.id && req.action && config.userAction.hasOwnProperty(req.action)) {
                    resolve(await Category.updateOne({_id: req.id}, {
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

    /**
     * update category
     * @returns {Promise<void>}
     * @param request
     */
    async deleteCategory(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let category = {
                        modifiedBy: request.owner,
                        isDeleted: true
                    };
                    resolve(await Category.updateOne({_id: request.id}, {$set: category}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("deleteCategory-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.CategoryService = CategoryService;
