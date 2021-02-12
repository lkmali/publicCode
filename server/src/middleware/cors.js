"use strict";
let cors = require("cors");
var responseService = require('../middleware/response');
const config = require('../../config.js');
var log = require("../logger/winston").LOG;
const errorFactory = require("../errorFactory/error-factory");
const message = require("../errorFactory/message");

class Cors {
    constructor() {
        this.corsConfiguration = (app) => {
            app.use((req, res, next) => {
                console.log("req.headers.origin", req.headers.origin);
                if (config.allowedOrigins.indexOf(req.headers.origin) > -1) {
                    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
                }
                // Request methods you wish to allow
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
                // Request headers you wish to allow
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');
                // Set to true if you need the website to include cookies in the requests sent
                // to the API (e.g. in case you use sessions)
                res.setHeader('Access-Control-Allow-Credentials', true);
                // Header security
                res.setHeader('Strict-Transport-Security', 'max-age=157680000');
                res.setHeader('X-Frame-Options', 'DENY');
                res.setHeader('X-XSS-Protection', '1; mode=block');
                next();
            });
        };
    }
}

exports.Cors = Cors;
