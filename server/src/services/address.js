var log = require("../logger/winston").LOG;
const AddressBook = require('../database/models/address-book');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");

class AddressService {
    /**
     * addressBook add
     * @returns {Promise<void>}
     * @param request
     */
    async addAddress(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.name && request.mobileNo && request.pinCode) {

                    if (request.default === true || request.default === 'true') {
                        await AddressBook.update({user: request.owner}, {$set: {default: false}}, {multi: true})
                    }

                    let addressBook = new AddressBook(
                        {
                            user: request.owner,
                            addressType: request.addressType || "Home",
                            name: request.name,
                            mobileNo: request.mobileNo,
                            pinCode: request.pinCode,
                            houseNo: request.houseNo,
                            mapLocation: request.mapLocation,
                            area: request.area,
                            landmark: request.landmark,
                            state: request.state,
                            city: request.city,
                            default: request.default === true || request.default === 'true',
                            country: request.country,
                        }
                    );
                    resolve(await addressBook.save());
                } else {
                    return reject(errorFactory.invalidRequest("missing name or mobileNo or  pinCode "));
                }

            } catch (error) {
                log.error("register-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * update addressBook
     * @returns {Promise<void>}
     * @param request
     */
    async updateAddress(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id && request.owner) {
                    let addressBook = {
                        modifiedBy: request.owner
                    };
                    if (request.addressType) addressBook["addressType"] = request.addressType;
                    if (request.name) addressBook["name"] = request.name;
                    if (request.mobileNo) addressBook["mobileNo"] = request.mobileNo;
                    if (request.pinCode) addressBook["pinCode"] = request.pinCode;
                    if (request.houseNo) addressBook["houseNo"] = request.houseNo;
                    if (request.mapLocation) addressBook["mapLocation"] = request.mapLocation;
                    if (request.area) addressBook["area"] = request.area;
                    if (request.landmark) addressBook["landmark"] = request.landmark;
                    if (request.state) addressBook["state"] = request.state;
                    if (request.city) addressBook["city"] = request.city;
                    if (request.country) addressBook["country"] = request.country;
                    if (request.landmark) addressBook["landmark"] = request.landmark;

                    if (request.default === true || request.default === 'true') {
                        await AddressBook.update({user: request.owner}, {$set: {default: false}}, {multi: true});
                        addressBook["default"] = true;
                    }


                    resolve(await AddressBook.updateOne({
                        _id: request.id,
                        user: request.owner
                    }, {$set: addressBook}));
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
     * @param request
     */
    async getAddressBook(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.id) {
                    let result = await AddressBook.findOne({_id: request.id, isDeleted: false, user: request.owner});
                    resolve(result)
                } else {
                    let query = {isDeleted: false, user: request.owner};
                    const count = await AddressBook.find(query).countDocuments();
                    let result = await AddressBook.find(query).sort({_id: -1}).skip(parseInt(request.offset)).limit(parseInt(request.limit));
                    resolve({total: count, records: result})
                }
            } catch (error) {
                log.error("CategoryService-->getAddressBook-->", error);
                reject(errorFactory.dataBaseError(error));
            }


        });
    }

    /**
     * deleteAddress addressBook
     * @returns {Promise<void>}
     * @param request
     */
    async deleteAddress(request) {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await AddressBook.remove({_id: request.id, user: request.owner}));
            } catch (error) {
                log.error("deleteCategory-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


}

module.exports.AddressService = AddressService;
