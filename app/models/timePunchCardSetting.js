var mongoose = require('mongoose');

module.exports = {
    CompanyTimePunchCardSetting: mongoose.model('CompanyTimePunchCardSetting', {
        createdTimestamp: {type: Date, default: Date.now},
        modifiedTimestamp: {type: Date, default: Date.now},
        companyDescriptor: {type: String, required: true},
        setting: {
            autoReportFullWeek: {
                active: {type: Boolean, required:true, default: false},
            },
            autoReportBreakTime: {
                active: {type: Boolean, required: true, default: false},
                breakTimeLengthHours: {type: Number, required: true, default: 0.5},
                breakTimeBaseWorkHours: {type: Number, required: true, default: 6}
            },
            holidayEntitled: {type: Boolean}
        }
    }),
    IndividualTimePunchCardSetting: mongoose.model('IndividualTimePunchCardSetting', {
        createdTimestamp: {type: Date, default: Date.now},
        modifiedTimestamp: {type: Date, default: Date.now},
        companyDescriptor: {type: String, required: true},
        personDescriptor: { 
            type: String, 
            required: true
        },
        setting: {
            autoReportFullWeek: {
                active: {type: Boolean},
            },
            autoReportBreakTime: {
                active: {type: Boolean},
                breakTimeLengthHours: {type: Number},
                breakTimeBaseWorkHours: {type: Number}
            },
            holidayEntitled: {type:Boolean}
        }
    })
};
