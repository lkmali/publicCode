const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const merchantSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    name: {type: String, required: true},
    shopName: {type: String},
    phone: {type: String, required: true},
    pinCode: {type: String, required: true},
    mapLocation: {type: String, required: true},
    area: {type: String},
    state: {type: String, required: true},
    houseNo: {type: String},
    landmark: {type: String},
    city: {type: String, required: true},
    country: {type: String, required: true},
    settings: {type: Object, default: {}},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "merchant", versionKey: false});
module.exports = mongoose.model('merchant', merchantSchema);
