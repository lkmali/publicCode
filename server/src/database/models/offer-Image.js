const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const offerImagesSchema = new mongoose.Schema({
    item: {type: Schema.Types.ObjectId, ref: 'items'},
    description: {type: String},
    title: {type: String},
     preview: {type: String},
    itemName: {type: String},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "offerImages", versionKey: false});

offerImagesSchema.pre('updateOne', function (next) {
    this.modifiedAt = new Date;
    return next();
});
offerImagesSchema.pre('save', function (next) {
    this.modifiedAt = new Date;
    return next();
});
module.exports = mongoose.model('offerImages', offerImagesSchema);
