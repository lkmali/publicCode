const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressBookSchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    addressType: {type: String, default: "Home", required: true},
    name: {type: String, required: true},
    mobileNo: {type: String, required: true},
    pinCode: {type: String, required: true},
    houseNo: {type: String},
    mapLocation: {type: Object},
    area: {type: String},
    landmark: {type: String},
    state: {type: String},
    city: {type: String},
    country: {type: String},
    default: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "addressBook", versionKey: false});
module.exports = mongoose.model('addressBook', addressBookSchema);
