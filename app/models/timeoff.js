var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Timeoff', {
    startDateTime: {type: Date, default: Date.now},
    duration: Number,
    status: String,
    type: String,
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