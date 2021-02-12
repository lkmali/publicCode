const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const paymentSchema = new mongoose.Schema({
    status: {type: String, default: "UnPaid", enum: ["UnPaid", "Paid", "Cancel"]},
    actualAmount: {type: Number, default: 0},
    discountAmount: {type: Number, default: 0},
    taxAmount: {type: Number, default: 0},
    cGst: {type: Number, default: 0},
    sGst: {type: Number, default: 0},
    total: {type: Number, default: 0},
    currency: {type: String, enum: ["INR", "USD"], default: "INR"},
    trackingId: String,
    mode: {type: String, default: "Cash"},
    provider: String, //GatewayName, BankName etc
    accountNumber: String, // BankAccount Number, Last 4 digits of card etc,
    bankDetails: String, // Bank info etc
    transactionDate: String,
    message: String,
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "payments", versionKey: false});


payments = mongoose.model('payments', paymentSchema);
module.exports = payments;