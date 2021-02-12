const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const unitsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "units", versionKey: false});
module.exports = mongoose.model('units', unitsSchema);
