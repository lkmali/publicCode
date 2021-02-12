var log = require("../logger/winston").LOG;
const Unit = require('../database/models/unit');
const errorFactory = require("../errorFactory/error-factory");

class UnitService {
    /**
     * category add
     * @returns {Promise<void>}
     * @param request
     */
    async add(request) {
        return new Promise(async (resolve, reject) => {
            try {
                let newUnit = new Unit({name: request.name});
                resolve(await newUnit.save());
            } catch (error) {
                log.error("UnitService-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    async getUnit() {
        return new Promise(async (resolve, reject) => {
                try {
                    let result = await Unit.find({isDeleted: false}, {name: 1}).sort({name: -1});
                    resolve(result);
                } catch (error) {
                    log.error("UnitService-->getUnit-->", error);
                    resolve([]);
                }


            }
        )
            ;
    }

    /**
     * update category
     * @returns {Promise<void>}
     * @param name
     */
    async deleteUnit(name) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await Unit.remove({name: request.name}));
            } catch (error) {
                log.error("ItemService-->deleteCategory-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.UnitService = UnitService;