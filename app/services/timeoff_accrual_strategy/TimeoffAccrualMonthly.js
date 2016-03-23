var moment = require('moment');

var CalculateAccuralValue = function(annualTarget, lastAccrualTimestamp) {
    
    // if last accrual time stamp is not set on a record, just 
    // assume that now is the start point of accrual. 
    // Achieve this by returning a value of 0, which will
    // update the last accrual timestamp 
    if (!lastAccrualTimestamp) {
        return 0.0;
    }

    if (!annualTarget) {
        return null;
    }

    // Compute the number of units pending accrual
    var currentMonthStart = moment.utc().startOf('month');
    var lastAccrualMonthStart = moment.utc(lastAccrualTimestamp).startOf('month');
    var diffNumMonth = currentMonthStart.diff(lastAccrualMonthStart, 'month', true);

    if (diffNumMonth > 0) {
        return (annualTarget / 12.0) * diffNumMonth;
    }

    return null;
};

module.exports = {
    CalculateAccuralValue: CalculateAccuralValue
};