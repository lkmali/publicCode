module.exports = {
    unauthorizedRequest: (message) => {
        return {code: "UNAUTHORIZED_REQUEST", statusCode: 401, message: message}
    },
    invalidRequest: (message) => {
        return {code: "INVALID_REQUEST", statusCode: 208, message: message}
    },
    notFoundData: (message) => {
        return {code: "NOT_FOUND_DATA", statusCode: 200, message: message}
    },
    alreadyExist: (message) => {
        return {code: "ALREADY_EXIST", statusCode: 208, message: message}
    },
    dataBaseError: (err) => {
        if (err) {
            if (err.code && err.statusCode && err.message) {
                return err
            } else if (err.code === 11000) {
                return {code: "ALREADY_EXIST", statusCode: 208, message: err.message || "already exist"}
            } else {
                return {code: "INTERNAL_SERVER_ERROR", statusCode: 208, message:  "internal server error"}
            }
        } else {
            return {code: "INTERNAL_SERVER_ERROR", statusCode: 500, message: "internal server error"}

        }
    },
    mailServerError: (err) => {
        return {code: "INTERNAL_SERVER_ERROR", statusCode: 500, message: "internal  mail server error"}
    },
    internalServerError: () => {
        return {code: "INTERNAL_SERVER_ERROR", statusCode: 500, message: "internal server error"}
    }
}
