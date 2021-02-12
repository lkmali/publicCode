const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fcmSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    type: {type: String, default: "APP", enum: ["WEB", "APP"]},
    token: {type: String},
    guest: {type: String},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "fcm", versionKey: false});
fcmSchema.index({user: 1, type: 1}, {unique: true});
fcmSchema.pre('updateOne', function save(next) {
    this.modifiedAt = Date.now;
    return next();
});

module.exports = mongoose.model('fcm', fcmSchema);
