var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('TimeoffQuota', {
    personDescriptor:{ 
        type: String, 
        required: true
    },
    quotaInfoCollection:[{
        timeoffType: { type: String, required: true },
        bankedHours: { type: Number, default: 0 },
        annualTargetHours: { type: Number, default: 0 },
        accrualSpecs: {
            accrualStartDate: { type: Date, required: true },
            accrualFrequency: { type: String, required: true }
        }
    }],
    createdTimestamp: { type: Date },
    modifiedTimestamp: { type: Date, default: Date.now }
});