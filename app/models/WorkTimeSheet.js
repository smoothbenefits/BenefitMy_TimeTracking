var mongoose = require('mongoose');

module.exports = mongoose.model('WorkTimeSheet', {
    weekStartDate: { type: Date, required: true },
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
    workHours: {
        sunday: { type: Number, required: true },
        monday: { type: Number, required: true },
        tuesday: { type: Number, required: true },
        wednesday: { type: Number, required: true },
        thursday: { type: Number, required: true },
        friday: { type: Number, required: true },
        saturday: { type: Number, required: true }
    },
    createdTimestamp: { type: Date, default: Date.now },
    updatedTimestamp: { type: Date, default: Date.now }
});