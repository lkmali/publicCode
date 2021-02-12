const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    phone: {type: String, required: true},
    otpExpires: {type: Date, required: true},
    verifyCode: {type: String, required: true},
    createdAt: {type: Date, default: Date.now},
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "validateLink", versionKey: false});

module.exports = mongoose.model('validateLink', userSchema);
