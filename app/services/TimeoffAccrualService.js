var TimeoffAccrualMonthly = require('./timeoff_accrual_strategy/TimeoffAccrualMonthly');
var TimeoffAccrualDaily = require('./timeoff_accrual_strategy/TimeoffAccrualDaily');
var TimeoffQuota = require('../models/timeoffQuota');

var AccrualFrequencyStrategyMapping = {
    'Monthly': TimeoffAccrualMonthly,
    'Daily': TimeoffAccrualDaily
};

/**
    Run accrual logic on all existing quota records
*/
var ExecuteAccrualForAllRecords = function() {
    TimeoffQuota
        .find({})
        .exec(function(err, records) {
            if (err) {
                // TODO: add logging
                return;
            }

            records.forEach(function(record) {
                _executeAccrualForRecord(record);
            });
        });
};

/**
    Execute the accrual logic on a single timeoff record.
    This covers all sub documents corresponding to the
    possible set of timeoff types.
*/
var _executeAccrualForRecord = function(timeoffQuotaRecord) {
    if (!_canAccrualQuotaRecord(timeoffQuotaRecord)) {
        // TODO: consider logging here
        return;
    }

    timeoffQuotaRecord.quotaInfoCollection.forEach(
        function(quotaInfoItem) {
            _executeAccrualForQuotaInfo(
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
var _executeAccrualForQuotaInfo = function(timeoffQuotaRecordId, quotaInfoItem) {
    if (!_canAccrualQuotaInfo(quotaInfoItem)) {
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

var _canAccrualQuotaRecord = function(timeoffQuotaRecord) {
    return timeoffQuotaRecord
        && timeoffQuotaRecord._id
        && timeoffQuotaRecord.quotaInfoCollection
        && timeoffQuotaRecord.quotaInfoCollection.length > 0;
};

var _canAccrualQuotaInfo = function(timeoffQuotaInfo) {
    return timeoffQuotaInfo
        && timeoffQuotaInfo._id
        && timeoffQuotaInfo.accrualSpecs
        && timeoffQuotaInfo.accrualSpecs.accrualRate
        && AccrualFrequencyStrategyMapping[timeoffQuotaInfo.accrualSpecs.accrualFrequency];
};

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
    ExecuteAccrualForAllRecords: ExecuteAccrualForAllRecords,
    ApplyValueDeltaToBankedBalance: ApplyValueDeltaToBankedBalance
};
