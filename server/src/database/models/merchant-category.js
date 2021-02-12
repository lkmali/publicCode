const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const merchantCategorySchema = new mongoose.Schema({
    merchant: {type: Schema.Types.ObjectId, ref: 'merchant', required: true},
    category: {type: Schema.Types.ObjectId, ref: 'category', required: true},
    pinCode: {type: String, required: true},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}

}, {collection: "merchantCategory", versionKey: false});

merchantCategorySchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
module.exports = mongoose.model('merchantCategory', merchantCategorySchema);
