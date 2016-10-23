var moment = require('moment');
var TimeoffAccrualStrategyTypes = require('./TimeoffAccrualStrategyTypes');

var CalculateAccuralValue = function(accrualRate, numberOfUnits) {
    
    if (!numberOfUnits) {
        return null;
    }

    if (!accrualRate) {
        return null;
    }

    return accrualRate * numberOfUnits;
};

module.exports = {
    TimeoffAccrualStrategyType: TimeoffAccrualStrategyTypes.RealTime,
    CalculateAccuralValue: CalculateAccuralValue
};