'use strict';
const configuration = require('../../config.js');
const expressJwt = require('express-jwt');
var jwt = require('jsonwebtoken');

class Jwt {

    constructor() {
        this.verify = (options) => {
            var secretCallBack = (req, payload, done) => {
                if (payload) {
                    payload.secret = configuration.jwt.secret;
                    options.secret(req, payload, done);
                } else {
                    done(null, new Error('unrecognized or missing secret'));
                }
            }

            return expressJwt({secret: secretCallBack});
        };
        this.generateToken = (user) => {
            return jwt.sign(user, configuration.jwt.secret, {
                expiresIn: configuration.jwt.expireTime
            });
        }
        this.verifyOpenApi = () => {
            return async (req, res, next) => {
                if (!req.headers.guest) {
                    return res.status(401).json({message: 'invalid_request'});
                }
                req.user = {guest: req.headers.guest};
                var token;
                if (req.headers.authorization) {
                    var parts = req.headers.authorization.split(' ');
                    if (parts.length === 2) {
                        var scheme = parts[0];
                        var credentials = parts[1];

                        if (/^Bearer$/i.test(scheme)) {
                            token = credentials;
                        } else {
                            token = req.headers.authorization;
                        }
                    } else {
                        token = req.headers.authorization;
                    }
                }

                if (!token) {
                    return next();
                }

                var dtoken;

                try {
                    dtoken = jwt.decode(token, {complete: true}) || {};
                    jwt.verify(token, configuration.jwt.secret);
                    return this.secretRecruitCallBack(req, dtoken.payload, next)
                } catch (err) {
                    return res.status(401).json({message: 'invalid_token'});
                }

            }


        }
        this.secretRecruitCallBack = (req, payload, done) => {
            //Generate new token for a authenticated request
            if (payload) {
                var token = this.generateToken({
                    id: payload.id,
                    phone: payload.phone,
                    role: payload.role
                });
                // Set the session details for the request in the request header
                // Add the new token to request header
                req.user = req.user || {};
                req.user["id"] = payload.id;
                req.user["phone"] = payload.phone;
                req.user["role"] = payload.role;
                req.headers['x-token'] = token;
                //Fetch and return the secrect key for the tenant of the request
                var sect = configuration.jwt.secret;
                done(null, sect);
            } else {
                done(null, null);
            }
        };
    }
}

exports.Jwt = Jwt;
