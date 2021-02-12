"use strict";
require("winston-daily-rotate-file");
require("moment");

const { createLogger, format } = require("winston");
const { combine, timestamp, printf } = format;
let fs = require("fs");
var winston = require("winston");
const config = require('../../config');


if (!fs.existsSync("logs")) {
    // Create the directory if it does not exist
    fs.mkdirSync("logs");
}
if (!fs.existsSync("profile")) {
    // Create the directory if it does not exist
    fs.mkdirSync("profile");
}
const myFormat = printf(({ level, message, label, timestamp }) => {
    return JSON.stringify({
        timestamp: new Date().toUTCString(),
        message: message,
        level: level
    });
});
const logger = createLogger({
    format: combine(timestamp(), myFormat),
    transports: [
        new (winston.transports.Console)({
            level: config.log.level,
            colorize: true
        }),
        //new files will be generated each day, the date patter indicates the frequency of creating a file.
        new winston.transports.DailyRotateFile({
            filename: "logs/debug-%DATE%.log",
            level: "debug",
            prepend: true,
            datePattern: config.log.datePattern,
            maxFiles: config.log.maxFiles ,
            maxSize: 1024 * 1024 * 10
        }),
        new (winston.transports.DailyRotateFile)({
            filename: "logs/errors-%DATE%.log",
            level: "error",
            prepend: true,
            datePattern: config.log.datePattern,
            maxFiles: config.log.maxFiles,
            maxSize: 1024 * 1024 * 10
        })
    ]
});
let getData = (data) => {
    if (data && typeof data === "object" && Object.keys(data).length > 0) {
        return JSON.stringify(data);
    }
    else if (data) {
        return data;
    }
    else {
        return "";
    }
};
const logging = {
    error: (message, data) => {
        return logger.error(message + getData(data));
    },
    debug: (message, data) => {
        return logger.debug(message + getData(data));
    },
    info: (message, data) => {
        return logger.info(message + getData(data));
    },
};
Object.defineProperty(exports, "LOG", { value: logging });
