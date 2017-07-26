var mongoose = require('mongoose');

module.exports = mongoose.model('Timeoff', {
    startDateTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: { type: String, required: true },
    type: { type: String, required: true },
    requestor: {
        email : {
            type: String,
            required: true
        },
        firstName: String,
        lastName: String,
        personDescriptor: {
            type: String,
            required: true
        },
        companyDescriptor: {
            type: String,
            required: false
        }
    },
    approver: {
        email : {
            type: String,
            required: true
        },
        firstName: String,
        lastName: String,
        personDescriptor: {
            type: String,
            required: true}
        },
    requestTimestamp: { type: Date, default: Date.now },
    decisionTimestamp: { type: Date }
});
