var log = require("../logger/winston").LOG;
const axios = require("axios");

class HttpService {

    constructor() {
    }


    errorCallback(error) {
        if (error && error.statusText) {
            return {message: error.statusText};
        }
        if (error && error.response) {
            return {
                message: error.response.statusText
            };
        } else if (error && error.message) {
            return {message: error.message};
        } else {
            return {message: error};
        }
    }

    async post(option, body = null, callback = this.errorCallback) {
        return new Promise((resolve, reject) => {
            try {
                option.method = "POST";
                if (body) {
                    option.data = JSON.stringify(body);
                }
                axios(option).then((response) => {
                    response = this.parseData(response);
                    if (response && response.status >= 200 && response.status < 300) {
                        resolve(this.parseData(response.data));
                    } else {
                        reject(callback(response));
                    }
                }).catch((error) => {
                    log.error("HttpService-->post--->", error);
                    reject(callback(error));
                });
            } catch (error) {
                log.error("HttpService-->post--->catch", error);
                reject(callback(error));
            }
        })

    }


    async get(option, errorCallback = this.errorCallback) {
        return new Promise((resolve, reject) => {
            try {
                option.method = "GET";
                axios(option).then((response) => {
                    response = this.parseData(response);
                    if (response && response.status >= 200 && response.status < 300) {
                        resolve(this.parseData(response.data));
                    } else {
                        reject(errorCallback(response));
                    }
                }).catch((error) => {
                    log.error("HttpService-->post--->", error);
                    reject(errorCallback(error));
                });
            } catch (error) {
                log.error("HttpService-->post--->catch", error);
                reject(errorCallback(error));
            }
        })

    }


    parseData(data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }

}

module.exports.HttpService = HttpService;
