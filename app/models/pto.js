var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Pto', {
    startDateTime: {type: Date, default: Date.now},
    length: Number,
    status: String,
    requestor: {  email : String,
        firstName: String,
        lastName: String,
        foreignKey: String},
    approver: { email : String,
        firstName: String,
        lastName: String,
        foreignKey: String },
    timestamp: { type: Date, default: Date.now}
});