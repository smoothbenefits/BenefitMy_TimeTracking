var mongoose = require('mongoose');

module.exports = mongoose.model('TimePunchCard', {
    date: { type: Date, required: true },
    employee: {  
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
            required: true
        }
    },
    project: {
        name: String,
        projectDescriptor: String
    },
    start: { type: Date, required: true },
    end: { type: Date, required: true },
    recordType: { type: String, required: true },
    hourlyRate: { type: Number },
    createdTimestamp: { type: Date, default: Date.now },
    updatedTimestamp: { type: Date, default: Date.now }
});