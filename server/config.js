const dotenv = require('dotenv');
var pathToRegexp = require('path-to-regexp');
const fs = require('fs');
dotenv.config();
normalize = (param) => {
    if (typeof (param) == 'string') {
        param = param.replace(/\s+/g, '');
        return JSON.parse(param);
    }
    return param;
};
booleanConvert = (param) => {
    return param === 'true' || param === true
};
module.exports = {
    swagger: {
        swaggerHost: process.env.SWAGGER_HOST || "localhost:3009",
        enable: booleanConvert(process.env.SWAGGER_ENABLE) || true,
    },
    message: {
        mesageApiKey: "",
        messageUrl: ""
    },
    androidApp: {
        merchant: "",
        user: "",
        domain: "",
        playStoreLink: ""
    },
    dynamicLink: {
        webAPIkey: "",
        firebasedynamiclinks: "",
        dynamicLinkBase: ""
    },

    allowedOrigins: ["*"],
    server: {
        timeout: process.env.SERVER_TIMEOUT || 10 * 60 * 1000,
        port: process.env.SERVER_PORT || 10010
    },
    clientAuthentication: {
        clientAuthenticationEnable: booleanConvert(process.env.CLIENT_AUTHENTICATION_ENABLE) || false,
        clientId: process.env.CLIENT_ID || "",
        clientSecret: process.env.CLIENT_SECRET || "",
        excludeAuthentication: ["/api/account/login/"]
    },
    FCM: {
        API: "https://fcm.googleapis.com/fcm/send",
        ServerKey: process.env.FCM_SERVER_KEY,
    },
    web: process.env.WEB || "http://localhost:10010",
    jwt: {
        secret: process.env.JWT_SECRET,
        expireTime: process.env.JWT_EXPIRE_TIME || 2592000,
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER
    },
    "userAction": {
        activate: false,
        deactivate: true
    },
    mongo: {
        uri: process.env.MONGO_URI || "mongodb://localhost:27017/mtc"
    },
    api: {
        excludeAuthentication: [pathToRegexp('/api/open/*'), pathToRegexp('/api/account/*'), pathToRegexp("/api/product/image/*")]
    },
    log: {
        level: process.env.LOGS_LEVEL || "debug",
        maxFiles: process.env.LOGS_MAX_FILES || 60,
        datePattern: process.env.LOGS_DATE_PATTERN || "DD-MM-YYYY"
    },
    validateLinkType: {
        validateMobile: "validateMobile",
        resetPassword: "resetPassword"
    },
    role: ["deliveryboy", "merchant"],
    "adminMobileNo": "9361821964",
    resetPasswordLinkExpireTime: 30,
    resendOtpMinutes: 2,
    encryption: {
        key: "",
        iv: "",
        enabled: true,
        algorithm: ""
    },
    profileSupportFileType: ['image/jpeg', 'image/png'],
    profileSupportFileSize: 1024 * 1024 * 2,
    rootPath: __dirname,
};
