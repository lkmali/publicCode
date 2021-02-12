const Fcm = require('../database/models/fcm');
const User = require('../database/models/user');
let HttpService = require("./http").HttpService;
var log = require("../logger/winston").LOG;
var messageServices = require('./message').MessageServices;
var config = require('../../config');
var admin = require("firebase-admin");
var serviceAccount = require("../../mtc7d57117d25c3");
var configLoader = false;

class FcmService {


    getFcmBody(data, type = "APP") {
        const notification = {};
        data["sound"] = "default";
        data["image"] = config.web + "/images/app-logo.png";
        data["icon"] = config.web + "/images/app-logo.png";
        notification["data"] = data;
        if (type === "WEB") {
            notification["notification"] = {
                "title": data.title,
                "body": data.body,
                "image": config.web + "/images/app-logo.png",
                "icon": config.web + "/images/app-logo.png",
                "sound": "default"
            };
        }
        return notification;
    }


    notifyAdmin(data, isMessageSend = true) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.sendAdminNotification(data);
                if (isMessageSend) {
                    let user = await User.find({role: "admin"});
                    if (user && user.length) {
                        for (let index = 0; index < user.length; index++) {
                            messageServices.prototype.sendMessage(user[index].phone, "Hi, Admin, we receive order so please check your admin panel");
                        }
                    }
                }

                resolve(true)
            } catch (error) {
                log.error("FcmService-->notifyAdmin-->", error);
                resolve(false);
            }
        });
    }


    notifyMerchant(data, textMessageData) {
        return new Promise(async (resolve, reject) => {
            try {
                let fcmUser = await Fcm.find({user: textMessageData.user});
                if (fcmUser && fcmUser.length) {
                    for (let index = 0; index < fcmUser.length; index++) {
                        await this.sendMerchantNotification(data, fcmUser[index].token, fcmUser[index].type);

                    }
                }
                messageServices.prototype.sendMessage(textMessageData.phone, textMessageData.message);
                resolve(true)
            } catch (error) {
                log.error("FcmService-->notifyMerchant-->", error);
                resolve(false);
            }
        });
    }


    sendMerchantNotification(data, token, type) {
        return new Promise(async (resolve, reject) => {
            try {
                let body = this.getFcmBody(data, type);
                console.log("body", body);
                resolve(await this.sendNotification(token, body));
            } catch (error) {
                log.error("FcmService-->sendMerchantNotification-->", error);
                resolve(error);
            }
        });
    }

    initializeApp() {
        configLoader = true;
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: ""
        })
    }

    async sendNotification(registrationToken, message) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!configLoader) {
                    this.initializeApp();
                }
                const notification_options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24,
                    "contentAvailable": true
                };
                admin.messaging().sendToDevice(registrationToken, message, notification_options)
                    .then(response => {
                        console.log(response);
                        resolve(response)
                    })
                    .catch(error => {
                        console.log(error);
                        resolve(error)

                    });
            } catch (error) {
                log.error("FcmService-->sendNotification-->", error);
                resolve(error);
            }
        });

    }


    async sendNotificationToTopic(topic, message) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!configLoader) {
                    this.initializeApp();
                }
                const notification_options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24,
                    "contentAvailable": true
                };
                admin.messaging().sendToTopic(topic, message, notification_options)
                    .then(response => {
                        console.log("sendNotificationToTopicresponse", response);
                        resolve(response)
                    })
                    .catch(error => {
                        console.log("sendNotificationToTopic", error);
                        resolve(error)

                    });
            } catch (error) {
                log.error("FcmService-->sendNotificationToTopic-->", error);
                resolve(error);
            }
        });

    }

    sendOfferImageNotification(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let body = this.getFcmBody(data);
                console.log("body", body);
                resolve(await this.sendNotificationToTopic("user", body));
            } catch (error) {
                log.error("FcmService-->sendAdminNotification-->", error);
                resolve(error);
            }
        });
    }

    sendAdminNotification(data) {
        return new Promise(async (resolve, reject) => {
            try {
                let body = this.getFcmBody(data, "WEB");
                resolve(await this.sendNotificationToTopic("admin", body));
            } catch (error) {
                log.error("FcmService-->sendAdminNotification-->", error);
                resolve(error);
            }
        });
    }

    async subscribeToTopic(registrationToken, topic) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(topic);
                console.log(registrationToken);
                if (!configLoader) {
                    this.initializeApp();
                }
                admin.messaging().subscribeToTopic(registrationToken, topic).then((decodedToken) => {
                    resolve(true);
                    // ...
                }).catch((error) => {
                    console.log("subscribeToTopic", error);
                    resolve(false);
                });
            } catch (error) {
                log.error("FcmService-->subscribeToTopic-->", error);
                resolve(false);
            }
        });

    }

    async unsubscribeFromTopic(registrationToken, topic) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(message);
                console.log(registrationToken);
                if (!configLoader) {
                    this.initializeApp();
                }
                admin.messaging().unsubscribeFromTopic(registrationToken, topic).then((decodedToken) => {
                    resolve(true);
                    // ...
                }).catch((error) => {
                    resolve(false);
                });
            } catch (error) {
                log.error("FcmService-->subscribeToTopic-->", error);
                resolve(false);
            }
        });

    }

    async verifyFcm(registrationToken) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(registrationToken);
                if (!configLoader) {
                    this.initializeApp();
                }
                admin.auth().verifyIdToken(registrationToken)
                    .then((decodedToken) => {
                        resolve(true);
                        // ...
                    })
                    .catch((error) => {
                        log.error("FcmService-->error-->", error);
                        resolve(false);
                    });
            } catch (error) {
                log.error("FcmService-->verifyFcm-->", error);
                resolve(false);
            }
        });

    }

}

module.exports.FcmService = FcmService;
