var config = require('../../config');
var mongoose = require('mongoose');
var User = require('./models/user');
var bcrypt = require("bcrypt-nodejs");
const crypto = require('crypto');
module.exports.setup = () => {
    //Set up default mongoose connection
    mongoose.connect(config.mongo.uri, {
        useNewUrlParser: true
    });
    // Get Mongoose to use the global promise library
    mongoose.Promise = global.Promise;
    //Get the default connection
    var mongodb = mongoose.connection;

    mongodb.on('connected', console.log.bind(console, 'MongoDB successfully connected'));
    //Bind connection to error event (to get notification of connection errors)
    mongodb.on('error', console.error.bind(console, 'MongoDB connection error:'));
};

module.exports.initialize = async () => {
    try {
        await addAdmin("admin");

        console.log("Initially Db entries done");
    } catch (error) {
        console.log(error)
    }

};

async function addAdmin(role) {
    var dbUsers = await User.findOne({phone: config.adminMobileNo});
    if (!dbUsers) {
        var user = new User();
        user.phone = config.adminMobileNo;
        user.accountVerified = true;
        console.log('admin phone:', config.adminMobileNo);
        user.role = role;
        return await user.save();
    } else {
        return false
    }
}
