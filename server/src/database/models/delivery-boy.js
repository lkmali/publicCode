const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const deliveryBoySchema = new mongoose.Schema({
    user: {type: Schema.Types.ObjectId, ref: 'users'},
    name: {type: String, required: true},
    phone: {type: String, required: true},
    pinCode: {type: String, required: true},
    mapLocation: {type: String, required: true},
    area: {type: String},
    state: {type: String},
    city: {type: String},
    country: {type: String},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "deliveryBoy", versionKey: false});
module.exports = mongoose.model('deliveryBoy', deliveryBoySchema);
