const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const categorySchema = new mongoose.Schema({
    name: {type: String, required: true, unique: true,},
    description: {type: String, required: true},
    preview: {type: String},
    isDeleted: {type: Boolean, default: false},
    createdBy: {type: Schema.Types.ObjectId, ref: 'users'},
    createdAt: {type: Date, default: Date.now},
    modifiedBy: {type: Schema.Types.ObjectId, ref: 'users'},
    modifiedAt: {type: Date, default: Date.now}

}, {collection: "category", versionKey: false});

categorySchema.pre('save', function (next) {
    this.name = this.name.toLowerCase();
    return next();
});
categorySchema.index({name: 1}, {unique: true});
categorySchema.index({name: "text", description: "text"}, {weights: {name: 1, description: 2}});
module.exports = mongoose.model('category', categorySchema);
