var responseService = require('../response');

class ClientAuthentication {
    static validateRequest() {
        const validateRequestMiddleware = async (req, res, next) => {
            let clientId = req.headers["clientId"] || req.headers["clientid"];
            let clientSecret = req.headers["clientSecret"] || req.headers["clientsecret"];
            if (clientId && clientSecret) {
                if (clientId === config.clientAuthentication.clientId && clientSecret === config.clientAuthentication.clientSecret) {
                    next();
                } else {
                    responseService.unauthorizedRequest(res)
                }
            } else {
                responseService.unauthorizedRequest(res)
            }
        };
        validateRequestMiddleware.unless = require("express-unless");
        return validateRequestMiddleware;
    }
}


module.exports.ClientAuthentication = ClientAuthentication;