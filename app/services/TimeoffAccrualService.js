var TimeoffAccrualAnnual = require('./timeoff_accrual_strategy/TimeoffAccrualAnnual');
var TimeoffAccrualMonthly = require('./timeoff_accrual_strategy/TimeoffAccrualMonthly');
var TimeoffAccrualDaily = require('./timeoff_accrual_strategy/TimeoffAccrualDaily');
var TimeoffAccrualHourly = require('./timeoff_accrual_strategy/TimeoffAccrualHourly');
var TimeoffAccrualWeekly = require('./timeoff_accrual_strategy/TimeoffAccrualWeekly');
var TimeoffAccrualStrategyTypes = require('./timeoff_accrual_strategy/TimeoffAccrualStrategyTypes');
var TimeoffQuota = require('../models/timeoffQuota');

var AccrualFrequencyTypes = {
    Monthly: 'Monthly',
    Daily: 'Daily',
    Hourly: 'Hourly',
    Weekly: 'Weekly',
    Annual: 'Annual'
};

var AccrualFrequencyStrategyMapping = {
};
AccrualFrequencyStrategyMapping[AccrualFrequencyTypes.Annual] = TimeoffAccrualAnnual;
AccrualFrequencyStrategyMapping[AccrualFrequencyTypes.Monthly] = TimeoffAccrualMonthly;
AccrualFrequencyStrategyMapping[AccrualFrequencyTypes.Weekly] = TimeoffAccrualWeekly;
AccrualFrequencyStrategyMapping[AccrualFrequencyTypes.Daily] = TimeoffAccrualDaily;
AccrualFrequencyStrategyMapping[AccrualFrequencyTypes.Hourly] = TimeoffAccrualHourly;

//////////////////////////////////////////////////////////////
// Start: Periodic Accrual Logic
//////////////////////////////////////////////////////////////

/**
    Run periodic accrual logic on all existing quota records
*/
var ExecutePeriodicAccrualForAllRecords = function() {
    TimeoffQuota
        .find({})
        .exec(function(err, records) {
            if (err) {
                // TODO: add logging
                return;
            }

            records.forEach(function(record) {
                _executePeriodicAccrualForRecord(record);
            });
        });
};

/**
    Execute the accrual logic on a single timeoff record.
    This covers all sub documents corresponding to the
    possible set of timeoff types.
*/
var _executePeriodicAccrualForRecord = function(timeoffQuotaRecord) {
    if (!_canPeriodicAccrualQuotaRecord(timeoffQuotaRecord)) {
        // TODO: consider logging here
        return;
    }

    timeoffQuotaRecord.quotaInfoCollection.forEach(
        function(quotaInfoItem) {
            _executePeriodicAccrualForQuotaInfo(
                timeoffQuotaRecord._id,
                quotaInfoItem
            );
        }
    );
};

/**
    Execute the accrual logic on a single quota info record, one of the sub
    documents corresponding to the possible set of timeoff types.
*/
var _executePeriodicAccrualForQuotaInfo = function(timeoffQuotaRecordId, quotaInfoItem) {
    if (!_canPeriodicAccrualQuotaInfo(quotaInfoItem)) {
        return;
    }

    // Get the appropriate strategy and compute the value for accrual
    var accrualStrategy = AccrualFrequencyStrategyMapping[quotaInfoItem.accrualSpecs.accrualFrequency];
    var accrualValue = accrualStrategy.CalculateAccuralValue(
            quotaInfoItem.accrualSpecs.accrualRate,
            quotaInfoItem.accrualSpecs.lastAccrualTimestamp
        );

    // Now really apply the accrual value to the quota info
    // sub document
    if (accrualValue != null) {
        _applyValueDeltaToBankedAndAccrualBalance(
            timeoffQuotaRecordId,
            quotaInfoItem._id,
            accrualValue
        );
    }
};

var _canPeriodicAccrualQuotaRecord = function(timeoffQuotaRecord) {
    return timeoffQuotaRecord
        && timeoffQuotaRecord._id
        && timeoffQuotaRecord.quotaInfoCollection
        && timeoffQuotaRecord.quotaInfoCollection.length > 0;
};

var _canPeriodicAccrualQuotaInfo = function(timeoffQuotaInfo) {
    var accrualStrategy = AccrualFrequencyStrategyMapping[timeoffQuotaInfo.accrualSpecs.accrualFrequency];
    return timeoffQuotaInfo
        && timeoffQuotaInfo._id
        && timeoffQuotaInfo.accrualSpecs
        && timeoffQuotaInfo.accrualSpecs.accrualRate
        && accrualStrategy
        && accrualStrategy.TimeoffAccrualStrategyType == TimeoffAccrualStrategyTypes.Periodic;
};

//////////////////////////////////////////////////////////////
// End: Periodic Accrual Logic
//////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////
// Start: RealTime Accrual Logic
//////////////////////////////////////////////////////////////

/**
    Perform hourly accrual for specified account and number of hours
*/
var PerformHourlyAccrual = function(personDescriptor, numberOfHours) {
    _performRealTimeAccrual(personDescriptor, AccrualFrequencyTypes.Hourly, numberOfHours);
};

var _performRealTimeAccrual = function(personDescriptor, accrualFrequencyType, numberOfUnits) {
    TimeoffQuota
        .findOne({personDescriptor: personDescriptor})
        .exec(function(err, quotaRecord) {
            if (err) {
                // TODO: add logging
                return;
            }

            _performRealTimeAccrualForRecord(quotaRecord, accrualFrequencyType, numberOfUnits);
        });
}; 

var _performRealTimeAccrualForRecord = function(timeoffQuotaRecord, accrualFrequencyType, numberOfUnits) {
    if (!_canPerformRealTimeAccrualQuotaRecord(timeoffQuotaRecord, accrualFrequencyType, numberOfUnits)) {
        // TODO: consider logging here
        return;
    }

    timeoffQuotaRecord.quotaInfoCollection.forEach(
        function(quotaInfoItem) {
            _performRealTimeAccrualForQuotaInfo(
                timeoffQuotaRecord._id,
                quotaInfoItem,
                accrualFrequencyType,
                numberOfUnits
            );
        }
    );
};

/**
    Execute the accrual logic on a single quota info record, one of the sub
    documents corresponding to the possible set of timeoff types.
*/
var _performRealTimeAccrualForQuotaInfo = function(timeoffQuotaRecordId, quotaInfoItem, accrualFrequencyType, numberOfUnits) {
    if (!_canPerformRealTimeAccrualQuotaInfo(quotaInfoItem, accrualFrequencyType)) {
        return;
    }

    // Get the appropriate strategy and compute the value for accrual
    var accrualStrategy = AccrualFrequencyStrategyMapping[accrualFrequencyType];
    var accrualValue = accrualStrategy.CalculateAccuralValue(
            quotaInfoItem.accrualSpecs.accrualRate,
            numberOfUnits
        );

    // Now really apply the accrual value to the quota info
    // sub document
    if (accrualValue != null) {
        _applyValueDeltaToBankedAndAccrualBalance(
            timeoffQuotaRecordId,
            quotaInfoItem._id,
            accrualValue
        );
    }
};

var _canPerformRealTimeAccrualQuotaRecord = function(timeoffQuotaRecord, accrualFrequencyType, numberOfUnits) {
    if (!numberOfUnits) {
        return false;
    }

    if (!timeoffQuotaRecord 
        || !timeoffQuotaRecord._id
        || !timeoffQuotaRecord.quotaInfoCollection
        || timeoffQuotaRecord.quotaInfoCollection.length <= 0) {
        return false;
    }

    var accrualStrategy = AccrualFrequencyStrategyMapping[accrualFrequencyType];
    if (!accrualStrategy
        || accrualStrategy.TimeoffAccrualStrategyType != TimeoffAccrualStrategyTypes.RealTime) {
        return false;
    }

    return true;
};

var _canPerformRealTimeAccrualQuotaInfo = function(timeoffQuotaInfo, accrualFrequencyType) {
    return timeoffQuotaInfo
        && timeoffQuotaInfo._id
        && timeoffQuotaInfo.accrualSpecs
        && timeoffQuotaInfo.accrualSpecs.accrualRate
        && timeoffQuotaInfo.accrualSpecs.accrualFrequency == accrualFrequencyType;
};

//////////////////////////////////////////////////////////////
// End: RealTime Accrual Logic
//////////////////////////////////////////////////////////////

var _applyValueDeltaToBankedAndAccrualBalance = function(quotaRecordId, quotaInfoId, valueDelta) {

    // The actual operation contains 3 editions
    //  1. Accrual on banked hours
    //  2. Accrual on accrued hours
    //  3. Set the "last accrued" time stamp
    // Good thing here is that the 3 operations are wrapped
    // in one single update, so they are of an atomic operation
    TimeoffQuota
    .findOneAndUpdate({
                        '_id': quotaRecordId,
                        'quotaInfoCollection._id': quotaInfoId
                      },
                      {
                        $inc: {
                            'quotaInfoCollection.$.bankedHours': valueDelta,
                            'quotaInfoCollection.$.accrualSpecs.accruedHours': valueDelta
                        },
                        $set: { 'quotaInfoCollection.$.accrualSpecs.lastAccrualTimestamp': Date.now() }
                      },
                      {},
                      function() {
        // TODO: Add logging
    });
};

/**
    Apply the given value delta to the timeoff quota data record, identified
    by the given person and timeoff type information.
    The primary use case of this is to account for timeoff request actions.
*/
var ApplyValueDeltaToBankedBalance = function(personDescriptor, timeoffType, valueDelta) {
    TimeoffQuota
    .findOneAndUpdate({
                        'personDescriptor': personDescriptor,
                        'quotaInfoCollection.timeoffType': timeoffType
                      },
                      { $inc: { 'quotaInfoCollection.$.bankedHours': valueDelta }},
                      {},
                      function() {
        // TODO: Add logging
    });
};

module.exports = {
    ExecutePeriodicAccrualForAllRecords: ExecutePeriodicAccrualForAllRecords,
    ApplyValueDeltaToBankedBalance: ApplyValueDeltaToBankedBalance,
    PerformHourlyAccrual: PerformHourlyAccrual
};
