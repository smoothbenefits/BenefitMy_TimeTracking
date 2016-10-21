var moment = require('moment');
var TimeoffAccrualStrategyTypes = require('./TimeoffAccrualStrategyTypes');

var CalculateAccuralValue = function(accrualRate, lastAccrualTimestamp) {
    
    // if last accrual time stamp is not set on a record, just 
    // assume that now is the start point of accrual. 
    // Achieve this by returning a value of 0, which will
    // update the last accrual timestamp 
    if (!lastAccrualTimestamp) {
        return 0.0;
    }

    if (!accrualRate) {
        return null;
    }

    // Compute the number of units pending accrual
    var currentMonthStart = moment.utc().startOf('month');
    var lastAccrualMonthStart = moment.utc(lastAccrualTimestamp).startOf('month');
    var diffNumMonth = currentMonthStart.diff(lastAccrualMonthStart, 'month', true);

    if (diffNumMonth > 0) {
        return accrualRate * diffNumMonth;
    }

    return null;
};

module.exports = {
    TimeoffAccrualStrategyType: TimeoffAccrualStrategyTypes.Periodic,
    CalculateAccuralValue: CalculateAccuralValue
};