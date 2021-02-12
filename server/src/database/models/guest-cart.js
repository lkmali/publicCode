const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const gustCartSchema = new mongoose.Schema({
    item: {type: Schema.Types.ObjectId, ref: 'items', required: true},
    actualAmount: {type: Number, default: 0},
    user: {type: String, required: true},
    quantity: {type: Number, default: 1},
    status: {type: String, default: "PENDING", enum: ["PENDING", "SELL", "CANCEL"]},
    price: {type: Number, default: 0},
    isDeleted: {type: Boolean, default: false},
    totalAmount: {type: Number, default: 0},
    guest: {type: String},
    propertyId: String,
    weight: {type: String},
    createdAt: {type: Date, default: Date.now},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "gustCart", versionKey: false});
/*cartSchema.index({createdBy: 1, status: 1});*/
gustCartSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    this.totalAmount = parseFloat(this.actualAmount) * parseInt(this.quantity);
    return next();
});
gustCartSchema.pre('updateOne', function (next) {
    this.modifiedAt = new Date;
    this.totalAmount = parseFloat(this.actualAmount) * parseInt(this.quantity);
    return next();
});
module.exports = mongoose.model('gustCart', gustCartSchema);