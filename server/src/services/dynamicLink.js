var log = require("../logger/winston").LOG;
let HttpService = require("./http").HttpService;
var config = require('../../config');
const errorFactory = require("../errorFactory/error-factory");

class DynamicLinkServices {
    async getDynamicLink(link, androidApp) {
        return new Promise(async (resolve, reject) => {
            try {

                const body = {
                    "dynamicLinkInfo": {
                        domainUriPrefix: config.dynamicLink.dynamicLinkBase,
                        link: link,
                        "androidInfo": {
                            "androidPackageName": androidApp,
                            "androidFallbackLink": config.androidApp.playStoreLink
                        },
                        "navigationInfo": {
                            "enableForcedRedirect": true,
                        },
                    }
                };
                let uri = config.dynamicLink.firebasedynamiclinks + "?key=" + config.dynamicLink.webAPIkey;

                let result = await HttpService.prototype.post({
                    url: uri,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }, body);
                resolve(result);


            } catch (error) {
                log.error("DynamicLinkServices-->getDynamicLink-->catch", error);
                return reject(errorFactory.internalServerError());
            }
        });

    }


    async getItemLinkShare(link, socialMetaTagInfo) {
        return new Promise(async (resolve, reject) => {
            try {

                const body = {
                    "dynamicLinkInfo": {
                        domainUriPrefix: config.dynamicLink.dynamicLinkBase,
                        link: link,
                        "androidInfo": {
                            "androidPackageName": config.androidApp.user,
                            "androidFallbackLink": config.androidApp.playStoreLink
                        },
                        "navigationInfo": {
                            "enableForcedRedirect": true,
                        },
                        "socialMetaTagInfo": socialMetaTagInfo
                    }
                };
                let uri = config.dynamicLink.firebasedynamiclinks + "?key=" + config.dynamicLink.webAPIkey;

                let result = await HttpService.prototype.post({
                    url: uri,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }, body);
                resolve(result);


            } catch (error) {
                log.error("DynamicLinkServices-->getDynamicLink-->catch", error);
                return reject(errorFactory.internalServerError());
            }
        });

    }

}

module.exports.DynamicLinkServices = DynamicLinkServices;
