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
    var currentDayStart = moment.utc().startOf('day');
    var lastAccrualDayStart = moment.utc(lastAccrualTimestamp).startOf('day');
    var diffNumDay = currentDayStart.diff(lastAccrualDayStart, 'day', true);
    var numDaysInYear = _getNumDaysInCurrentYear();

    if (diffNumDay > 0) {
        return (annualTarget / numDaysInYear) * diffNumDay;
    }

    return null;
};

var _getNumDaysInCurrentYear = function() {
    var yearDuration = moment.duration({ 
        from: moment.utc().startOf('year'), 
        to: moment.utc().endOf('year') });
    return yearDuration.asDays();
};

module.exports = {
    CalculateAccuralValue: CalculateAccuralValue
};