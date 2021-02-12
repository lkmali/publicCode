const bcrypt = require("bcrypt-nodejs");
const crypto = require('crypto');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    phone: {type: String, unique: true, required: true},
    role: {type: String, default: "user", enum: ["user", "admin", "deliveryboy", "merchant"]},
    name: {type: String},
    password: {type: String},
    picture: String,
    accountVerified: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "users", versionKey: false});
userSchema.index({phone: 1}, {unique: true});
userSchema.index({phone: "text", name: "text"}, {weights: {phone: 1, name: 2}});
userSchema.pre('update', function save(next) {
    this.modifiedAt = Date.now;
    return next();
});


/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    cb(bcrypt.compareSync(candidatePassword, this.password));
};


users = mongoose.model('users', userSchema);
module.exports = users;
