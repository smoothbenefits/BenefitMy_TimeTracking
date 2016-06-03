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
                },
                recordType: { type: String }
            },
            monday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            tuesday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            wednesday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            thursday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            friday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            saturday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            }
        },
        overtimeHours: {
            sunday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            monday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
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
                },
                recordType: { type: String }
            },
            thursday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            friday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            },
            saturday: {
                hours: { type: Number, default: 0 },
                timeRange: {
                    start: { type: Date },
                    end: { type: Date }
                },
                recordType: { type: String }
            }
        }
    }],
    createdTimestamp: { type: Date, default: Date.now },
    updatedTimestamp: { type: Date, default: Date.now }
});