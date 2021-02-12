var log = require("../logger/winston").LOG;
let HttpService = require("./http").HttpService;
var config = require('../../config');
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");

class MessageServices {
    async sendMessage(mobileNo, message) {
        return new Promise(async (resolve, reject) => {
            try {
                let uri = config.message.messageUrl + "?apiKey=" + config.message.mesageApiKey + "&sender=MTCDVM&numbers=" + mobileNo + "&message=" + encodeURIComponent(message);
                let result = await HttpService.prototype.get({
                    url: uri,
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if (result && result.status === "success") {
                    resolve(true);
                } else {
                    log.error("MessageServices-->sendMessage-->", result);
                    if (result && result.warnings && result.warnings.length) {
                        return reject(errorFactory.invalidRequest(result.warnings[0].message));
                    } else {
                        return reject(errorFactory.internalServerError());
                    }
                }


            } catch (error) {
                log.error("MessageServices-->sendMessage-->catch", error);
                return reject(errorFactory.internalServerError());
            }
        });

    }

}

module.exports.MessageServices = MessageServices;
