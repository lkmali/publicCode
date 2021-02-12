const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const merchantItemSchema = new mongoose.Schema({
    merchant: {type: Schema.Types.ObjectId, ref: 'merchant'},
    item: {type: Schema.Types.ObjectId, ref: 'items', required: true},
    category: {type: Schema.Types.ObjectId, ref: 'category', required: true},
    merchantCategory: {type: Schema.Types.ObjectId, ref: 'merchantCategory'},
    pinCode: {type: String, required: true},
    price: {type: Number, required: true},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}

}, {collection: "merchantItem", versionKey: false});

merchantItemSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
module.exports = mongoose.model('merchantItem', merchantItemSchema);
