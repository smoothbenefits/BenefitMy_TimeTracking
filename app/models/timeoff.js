var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('Timeoff', {
    startDateTime: {type: Date, default: Date.now},
    duration: Number,
    status: String,
    type: String,
    requestor: {  email : { 
            type: String, 
            required: true 
        },
        firstName: String,
        lastName: String,
        personDescriptor: String},
    approver: { email : { 
            type: String, 
            required: true 
        },
        firstName: String,
        lastName: String,
        personDescriptor: String },
    requestTimestamp: { type: Date, default: Date.now},
    decisionTimestamp: { type: Date }
});