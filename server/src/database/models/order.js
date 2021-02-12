const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    cart: [{
        type: Schema.Types.ObjectId,
        ref: 'cart'
    }],
    orderId: String,
    billingInfo: {type: Object},
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'payments'
    },
    status: {type: String, default: "Pending", enum: ["Pending", "Dispatch", "Delivered", "Cancel", "Replace"]},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "orders", versionKey: false});

orderSchema.pre('updateOne', function (next) {
    this.modifiedAt = new Date;
    return next();
});
orderSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
orders = mongoose.model('orders', orderSchema);
module.exports = orders;