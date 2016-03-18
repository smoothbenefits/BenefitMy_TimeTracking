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
    timecards: [{
        tags: [{
            tagType: { type: String, required: true },
            tagContent: { type: String, required: true }
        }],
        workHours: {
            sunday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            monday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            tuesday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            wednesday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            thursday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            friday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            saturday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            }
        },
        overtimeHours: {
            sunday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            monday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            tuesday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            wednesday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            thursday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            friday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            },
            saturday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                }
            }
        }
    }],
    createdTimestamp: { type: Date, default: Date.now },
    updatedTimestamp: { type: Date, default: Date.now }
});