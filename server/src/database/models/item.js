const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const itemsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    unit: {type: String},
    quantity: {type: Number},
    price: {type: Number, required: true},
    stock: {type: String, required: true, default: "AVAILABLE", enum: ["AVAILABLE", "UN_AVAILABLE"]},
    currency: {type: String, enum: ["INR", "USD"], default: "INR"},
    description: {type: String},
    gst: {type: Number, default: 0},
    hsnCode: {type: String},
    preview: {type: String},
    shareLink: {type: String},
    property: [{
        quantity: Number,
        price: Number,
        actualPrice: Number,
        discount: {type: Number, default: 0}
    }],
    images: {type: Object, default: {}},
    isDeleted: {type: Boolean, default: false},
    category: {type: Schema.Types.ObjectId, ref: 'category', required: true},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "items", versionKey: false});
itemsSchema.index({name: "text", brand: "text", description: "text"}, {weights: {brand: 2, name: 1, description: 3}});
itemsSchema.pre('updateOne', function (next) {
    this.modifiedAt = new Date;
    return next();
});
itemsSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
module.exports = mongoose.model('items', itemsSchema);
