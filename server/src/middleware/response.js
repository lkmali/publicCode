module.exports.response = (req, err, data, res) => {
    if (err) {
        if (err.hasOwnProperty("code") && err.hasOwnProperty("message") && err.hasOwnProperty('statusCode')) {
            res.status(200).json({
                success: false, error: {
                    message: err.message,
                    code: err.code
                }

            });
        } else {
            res.status(200).json({
                success: false,
                error: {
                    message: err.message,
                    code: err.code
                }

            });
        }
    } else {
        res.status(200).json({
            success: true, data: data
        });
    }
};


module.exports.unauthorizedRequest = (res) => {
    res.status(401).json({
        success: false, error: {
            message: "Unauthorized request",
            code: "UNAUTHORIZED_REQUEST"
        }

    });
};