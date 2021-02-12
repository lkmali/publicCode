const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const orderDeliverySchema = new mongoose.Schema({
    order: {type: Schema.Types.ObjectId, ref: 'orders', required: true},
    merchantCart: [{
        type: Schema.Types.ObjectId,
        ref: 'merchantCart'
    }],
    merchants: [{
        status: {type: String, default: "Rejected", enum: ["Confirmed", "Rejected", "Dispatch", "Cancel"]},
        merchant: {type: Schema.Types.ObjectId, ref: 'merchant'}
    }],
    status: {type: String, default: "Pending", enum: ["Pending", "Confirmed", "Delivered"]},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "orderDelivery", versionKey: false});

orderDeliverySchema.pre('updateOne', function (next) {
    this.modifiedAt = new Date;
    return next();
});
orderDeliverySchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
orders = mongoose.model('orderDelivery', orderDeliverySchema);
module.exports = orders;
