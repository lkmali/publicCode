var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var itemReviewSchema = new Schema({
    comment: {type: String},
    user: {type: Schema.Types.ObjectId, ref: 'users', required: true},
    rating: {type: Number, required: true},
    isDeleted: {type: Boolean, default: false},
    modifiedOn: {type: Date, default: Date.now},
    createdOn: {type: Date, default: Date.now}
}, {collection: "itemReview", versionKey: false});

itemReviewSchema.pre('update', function save(next) {
    this.modifiedOn = Date.now;
    return next();
});
module.exports = mongoose.model('itemReview', itemReviewSchema);
