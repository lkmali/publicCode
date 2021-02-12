const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const cartSchema = new mongoose.Schema({
    item: {type: Schema.Types.ObjectId, ref: 'items', required: true},
    actualAmount: {type: Number, default: 0},
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    currency: {type: String, enum: ["INR", "USD"], default: "INR"},
    quantity: {type: Number, default: 1},
    gst: {type: Number, default: 0},
    gstText: {type: Number, default: 0},
    price: {type: Number, default: 0},
    guest: {type: String},
    propertyId: String,
    weight: {type: String},
    status: {type: String, default: "PENDING", enum: ["PENDING", "SELL", "CANCEL"]},
    isDeleted: {type: Boolean, default: false},
    totalAmount: {type: Number, default: 0},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "cart", versionKey: false});
/*cartSchema.index({createdBy: 1, status: 1});*/
cartSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    this.totalAmount = parseFloat(this.actualAmount) * parseInt(this.quantity);
    return next();
});
cartSchema.pre('updateOne', function (next) {
    this.modifiedAt = new Date;
    this.totalAmount = parseFloat(this.actualAmount) * parseInt(this.quantity);
    return next();
});
module.exports = mongoose.model('cart', cartSchema);