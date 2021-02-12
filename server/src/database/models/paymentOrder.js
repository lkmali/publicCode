const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const paymentSchema = new mongoose.Schema({

    order: {type: Schema.Types.ObjectId, ref: 'orders'},
    status: String,
    paymentResponse: Object,
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "paymentOrder", versionKey: false});


orders = mongoose.model('paymentOrder', paymentSchema);
module.exports = orders;