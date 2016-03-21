var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TimeoffQuotaSchema = new Schema({
    personDescriptor:{ 
        type: String, 
        required: true
    },
    quotaInfoCollection:[{
        timeoffType: { type: String, required: true },
        bankedHours: { type: Number, default: 0 },
        annualTargetHours: { type: Number, default: 0 },
        accrualSpecs: {
            accrualFrequency: { type: String, required: true },
            accruedHours: { type: Number, default: 0 },
            lastAccrualTimestamp: { type: Date, default: Date.now }
        }
    }],
    createdTimestamp: { type: Date },
    modifiedTimestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimeoffQuota', TimeoffQuotaSchema);