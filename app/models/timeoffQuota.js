var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TimeoffQuotaSchema = new Schema({
    personDescriptor:{ 
        type: String, 
        required: true
    },
    companyDescriptor:{
        type: String,
        required: true
    },
    quotaInfoCollection:[{
        timeoffType: { type: String, required: true },
        bankedHours: { type: Number, default: 0 },
        accrualSpecs: {
            accrualRate: { type : Number, default: 0 },
            accrualFrequency: { type: String, required: true },
            accruedHours: { type: Number, default: 0 },
            lastAccrualTimestamp: { type: Date, default: Date.now }
        }
    }],
    createdTimestamp: { type: Date, default: Date.now },
    modifiedTimestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimeoffQuota', TimeoffQuotaSchema);