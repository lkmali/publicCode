const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const merchantCartSchema = new mongoose.Schema({
    merchant: {type: Schema.Types.ObjectId, ref: 'merchant', required: true},
    cart: {type: Schema.Types.ObjectId, ref: 'cart', required: true},
    order: {type: Schema.Types.ObjectId, ref: 'orders', required: true},
    price: {type: Number, required: true},
    totalAmount: {type: Number, required: true},
    isDeleted: {type: Boolean, default: false},
    conformation: {type: Boolean, default: false},
    status: {type: String, default: "PENDING", enum: ["PENDING", "DISPATCH", "SELL", "CANCEL"]},
    paymentStatus: {type: String, default: "UnPaid", enum: ["UnPaid", "Paid"]},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}

}, {collection: "merchantCart", versionKey: false});

merchantCartSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
module.exports = mongoose.model('merchantCart', merchantCartSchema);
