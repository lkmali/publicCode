const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workingLocationSchema = new mongoose.Schema({
    pinCode: {type: String, required: true, unique: true,},
    isDeleted: {type: Boolean, default: false},
    createdAt: {type: Date, default: Date.now},
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    modifiedAt: {type: Date, default: Date.now}
}, {collection: "workingLocation", versionKey: false});

/*userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    cb(bcrypt.compareSync(candidatePassword, this.password));
};*/
module.exports = mongoose.model('workingLocation', userSchema);
