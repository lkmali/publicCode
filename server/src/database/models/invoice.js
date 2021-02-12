const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {type: String, required: true, unique: true},
    invoiceDate: {type: Date, default: Date.now},
    invoiceStatus: String, // New, Quote, Invoiced, Paid
    order: {type: Schema.Types.ObjectId, ref: 'orders'},
    payment: {type: Schema.Types.ObjectId, ref: 'payments'},

    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "invoice", versionKey: false});


orders = mongoose.model('invoice', invoiceSchema);
module.exports = orders;