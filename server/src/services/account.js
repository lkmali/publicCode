var messageServices = require('./message').MessageServices;
var bcrypt = require("bcrypt-nodejs");
var log = require("../logger/winston").LOG;
const User = require('../database/models/user');
const ValidateLink = require('../database/models/validate-link');
const Fcm = require('../database/models/fcm');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");
var config = require('../../config');
const HelperService = require('./helper').HelperService;
const FcmService = require('./fcm.js').FcmService;

class AccountService {


    /**
     * send otp for mobile verify
     * @returns {Promise<void>}
     * @param request
     */
    async sendOtp(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.phone) {
                    return reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
                }
                var dbUsers = await User.findOne({phone: request.phone});
                if (!dbUsers) {
                    dbUsers = await new User({phone: request.phone, role: "user"}).save();
                }
                if (dbUsers.isDeleted) {
                    return reject(errorFactory.invalidRequest(message.DEACTIVATE_ACCOUNT));
                }

                let resetPassword = await ValidateLink.findOne({
                    phone: request.phone
                });
                let verifyCode = HelperService.prototype.makeid(6);
                let currentTime = new Date();
                currentTime.setMinutes(currentTime.getMinutes() + config.resetPasswordLinkExpireTime);
                if (!resetPassword) {
                    resetPassword = new ValidateLink({
                        verifyCode: verifyCode,
                        otpExpires: currentTime,
                        phone: request.phone,
                        createdBy: dbUsers._id
                    })
                } else {
                    verifyCode = resetPassword["verifyCode"];
                    resetPassword["verifyCode"] = verifyCode;
                    resetPassword["otpExpires"] = currentTime;
                    resetPassword["modifiedAt"] = new Date();
                }
                await messageServices.prototype.sendMessage(request.phone, this.getMessage("verification", verifyCode));
                await resetPassword.save();
                resolve(true);
            } catch (error) {
                log.error("register-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    /**
     * reset Password for the given phone
     * @returns {Promise<void>}
     * @param request
     */
    async verifyMobileNo(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (request.phone && request.verifyCode) {
                    let verifyMobile = await ValidateLink.findOne({
                        phone: request.phone,
                        verifyCode: request.verifyCode
                    });
                    if (!verifyMobile) {
                        return reject(errorFactory.invalidRequest(message.INVALID_LINK))
                    }
                    let currentTime = new Date();
                    let expiryTime = new Date(verifyMobile.passwordResetExpires);
                    if (expiryTime < currentTime) {
                        return reject(errorFactory.invalidRequest(message.LINK_EXPIRED))
                    }
                    await ValidateLink.deleteOne({_id: verifyMobile._id});
                    var dbUsers = await User.findOne({phone: request.phone});
                    resolve({
                        id: dbUsers._id,
                        phone: dbUsers.phone,
                        name: dbUsers.name || "",
                        role: dbUsers.role,
                        accountVerified: dbUsers.accountVerified
                    });
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST), null)
                }
            } catch (error) {
                log.error("verifyMobileNo-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }

    /**
     * admin can register new user
     * @returns {Promise<void>}
     * @param request
     */
    async updateUser(request) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!request.name || (request.role && config.role.indexOf(request.role.toLowerCase()) < 0)) {
                    return reject(errorFactory.invalidRequest(message.INVALID_REGISTER_USER_REQUEST))
                }
                var dbUsers = await User.findOne({_id: request.owner});
                if (!dbUsers) {
                    return reject(errorFactory.alreadyExist("User not found"))
                }

                dbUsers["name"] = request.name;
                if (request.role && config.role.indexOf(request.role.toLowerCase()) >= 0) {
                    dbUsers["role"] = request.role.toLowerCase();
                }
                dbUsers["accountVerified"] = true;

                await dbUsers.save();
                resolve({
                    id: dbUsers._id,
                    phone: dbUsers.phone,
                    name: dbUsers.name || "",
                    role: dbUsers.role,
                    accountVerified: dbUsers.accountVerified
                });
            } catch (error) {
                log.error("register-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });

    }


    getMessage(otpType, otp) {
        // `${config.api.base}${config.api.user}`
        return `Your OTP for verification to mtc Trading Company App is ${otp} . Valid for 30 minutes. Please do not share this OTP. -%nmtc`
    }

    /**
     * we are getting all user
     * @param data
     */
    async getUsers(data) {
        return new Promise(async (resolve, reject) => {
                try {
                    if (data.id) {
                        let result = await User.findOne({_id: data.id});
                        resolve(result)
                    } else {

                        let query = {};
                        if (data.searchText) {
                            query["$text"] = {"$search": data.searchText};
                        }
                        const count = await User.find(query).countDocuments();
                        let result = await User.find(query).sort({_id: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
                        resolve({total: count, records: result})
                    }
                } catch
                    (error) {
                    log.error("UserServices-->getUsers-->", error);
                    reject(errorFactory.dataBaseError(error));
                }


            }
        )
    }

    async deleteUser(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (data.id) {
                    resolve(await User.remove({_id: data.id}));
                } else {
                    reject(errorFactory.invalidRequest(message.INVALID_REQUEST));
                }
            } catch (error) {
                log.error("UserServices-->deleteOfferImage-->catch", error);
                return reject(errorFactory.dataBaseError(error));
            }
        });
    }

    async UserAction(req) {
        return new Promise(async (resolve, reject) => {
            if (req.phone && req.action && config.userAction.hasOwnProperty(req.action)) {
                User.updateOne({phone: req.phone}, {
                    $set: {
                        isDeleted: config.userAction[req.action],
                        modifiedBy: req.owner
                    }
                }).then((result) => {
                    if (result && result.nModified >= 1) {
                        resolve(result);
                    } else {
                        reject(errorFactory.invalidRequest(message.INVALID_PHONE));
                    }
                }).catch((error) => {
                    log.error("AccountService-->AccountService-->", error);
                    reject(errorFactory.dataBaseError(error));
                });
            } else {
                reject(errorFactory.invalidRequest(message.INVALID_REQUEST))
            }

        });
    }

    async UpdateFcmCode(data) {
        return this.addFcmToken(data);
    }


    async addFcmToken(data) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!data.token) {
                    return resolve(true);
                }
                await FcmService.prototype.subscribeToTopic(data.token, data.role);
                if (data.owner) {
                    let result = await Fcm.updateOne({user: data.owner, type: data.type || "APP"}, {
                        $set: {
                            user: data.owner,
                            token: data.token,
                            type: data.type || "APP",
                            modifiedBy: data.owner,
                            createdBy: data.owner,
                            guest: data.guest
                        }
                    }, {upsert: true});
                    return resolve(true);
                } else {
                    let result = await Fcm.updateOne({guest: data.guest, type: data.type || "APP"}, {
                        $set: {
                            guest: data.guest,
                            token: data.token,
                            type: data.type || "APP"
                        }
                    }, {upsert: true});
                }
                resolve(true);


            } catch (error) {
                log.error("AccountService-->UpdateFcmCode-->", error);
                return resolve(true);
            }


        });
    }


}

module.exports.AccountService = AccountService;
