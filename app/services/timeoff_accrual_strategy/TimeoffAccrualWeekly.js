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
    var currentWeekStart = moment.utc().startOf('week');
    var lastAccrualWeekStart = moment.utc(lastAccrualTimestamp).startOf('week');
    var diffNumWeek = currentWeekStart.diff(lastAccrualWeekStart, 'week', true);

    if (diffNumWeek > 0) {
        return accrualRate * diffNumWeek;
    }

    return null;
};

module.exports = {
    TimeoffAccrualStrategyType: TimeoffAccrualStrategyTypes.Periodic,
    CalculateAccuralValue: CalculateAccuralValue
};