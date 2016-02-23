var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('TimeoffQuota', {
    personDescriptor:{ 
        type: String, 
        required: true
    },
    quota:{
        sickDaysInHours: Number,
        paidTimeOffInHours: Number
    },
    createdTimestamp: { type: Date, default: Date.now },
    modifiedTimestamp: { type: Date }
});