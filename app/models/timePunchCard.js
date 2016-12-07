var mongoose = require('mongoose');
var AttributeSchema = require('./attribute').schema;

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
    attributes: [ AttributeSchema ],
    start: { type: Date },
    end: { type: Date },
    inHours: { type: Boolean },
    recordType: { type: String, required: true },
    inProgress: { type: Boolean },
    createdTimestamp: { type: Date, default: Date.now },
    updatedTimestamp: { type: Date, default: Date.now }
});
