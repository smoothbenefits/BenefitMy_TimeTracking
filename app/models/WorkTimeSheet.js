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
    overtimeHours: {
        sunday: { type: Number, default: 0 },
        monday: { type: Number, default: 0  },
        tuesday: { type: Number, default: 0  },
        wednesday: { type: Number, default: 0  },
        thursday: { type: Number, default: 0  },
        friday: { type: Number, default: 0  },
        saturday: { type: Number, default: 0  }
    },
    createdTimestamp: { type: Date, default: Date.now },
    updatedTimestamp: { type: Date, default: Date.now }
});