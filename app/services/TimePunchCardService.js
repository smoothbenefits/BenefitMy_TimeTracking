var _ = require('underscore');
var moment = require('moment');
var LocationService = require('./LocationService');
var appSettings = require('../settings/appSettings');
var AWSSNSPublisher = require('./aws/SNSPublisher');
var AWSSNSUtilty = require('./aws/SNSUtility');
var PunchCardRecognitionFailedEventFactory = require('./event_factories/PunchCardRecognitionFailedEventFactory');
var TimePunchCard = require('../models/timePunchCard');
var TimePunchCardSettingService = require('./TimePunchCardSettingService');

// For some reason, the destructuring form does not work. We should figure out later
// but not a priority for now.
var TimeoffService = require('./TimeoffService');
var TimeoffAccrualService = require('./TimeoffAccrualService');
var TimeoffStatus = TimeoffService.TimeoffStatus;
var TimeoffTypes = TimeoffService.TimeoffTypes;

var TimeCardTypes = {
    WorkTime: 'Work Time',
    CompanyHoliday: 'Company Holiday',
    PaidTimeOff: 'Paid Time Off',
    SickTime: 'Sick Time',
    PersonalLeave: 'Personal Leave',
    BreakTime: 'Break Time'
};

var TimeCardTypeBehaviors = {
  'Work Time': {NegativeValue: false, CountWorkingHours: true},
  'Company Holiday': {NegativeValue: false, CountWorkingHours: false},
  'Paid Time Off': {NegativeValue: false, CountWorkingHours: false},
  'Sick Time': {NegativeValue: false, CountWorkingHours: false},
  'Personal Leave': {NegativeValue: false, CountWorkingHours: false},
  'Break Time': {NegativeValue: true, CountWorkingHours: true}
};

var createTimeCard = function(cardToCreate, successCallback, failureCallback) {
    TimePunchCard.create(cardToCreate, function(err, createdEntry) {
      if (err) {
        if (failureCallback) {
            failureCallback(err);
        }
        return;
      }

      // After the entry is created, depending on the setting,
      // create lunch time
      CreateBreakTimeCardIfNecessary(createdEntry);

      // Perform real time accrual, if appropriate
      var workHours = getWorkHoursFromCard(createdEntry);
      if (workHours) {
        TimeoffAccrualService.PerformHourlyAccrual(createdEntry.employee.personDescriptor, workHours);
      }

      // Send the photo matching failure email if neccessary
      if (isRecognitionFailed(createdEntry)){
        raisePunchCardRecognitionFailedEvent(createdEntry);
      }

      if (successCallback) {
        successCallback(createdEntry);
      }
      return;
    });
};

var updateTimeCard = function(timeCardId, cardToUpdate, successCallback, failureCallback) {
    cardToUpdate.updatedTimestamp = Date.now();

    // Since we are going to use person descriptor as lookup
    // to perform the update, Mongo will complain about "_id"
    // and/or "__v" being presented on the new model, so we
    // have to clear those up.
    delete cardToUpdate._id;
    delete cardToUpdate.__v;

    // [TODO]
    // It is weird that we use both a findById and then another 
    // findOneAndUpdated here. Though I could not find a much better
    // way to achieve the need of both the before and the after documents
    // of this update.
    // If we found a better way here, this should be revised.
    TimePunchCard
    .findById(timeCardId, function(err, originalCard) {
        if (err) {
            if (failureCallback) {
                failureCallback(err);
            }
            return;
        }

        TimePunchCard
        .findOneAndUpdate(
            {_id:timeCardId},
            cardToUpdate,
            function(err, resultCard) {
          if (err) {
            if (failureCallback) {
                failureCallback(err);
            }
            return;
          }

          // After the entry is edited, depending on the setting,
          // create lunch time
          CreateBreakTimeCardIfNecessary(resultCard);

          // Perform real time accrual, if appropriate
          // For card update, this is to account for the diff between the original 
          // and the updated cards
          var originalWorkHours = getWorkHoursFromCard(originalCard);
          var updatedWorkHours = getWorkHoursFromCard(resultCard);
          if (originalWorkHours != null && updatedWorkHours != null) {
            var diffWorkHours = updatedWorkHours - originalWorkHours;
            TimeoffAccrualService.PerformHourlyAccrual(resultCard.employee.personDescriptor, diffWorkHours);
          }

          // Send the photo matching failure email if neccessary
          if (isRecognitionFailed(resultCard)){
            raisePunchCardRecognitionFailedEvent(resultCard);
          }
          
          if (successCallback) {
            successCallback(resultCard);
          }

          return;
        });
    });
};

var deleteTimeCard = function(timeCardId, successCallback, failureCallback) {
    TimePunchCard.findByIdAndRemove(timeCardId, function(err, deletedCard) {
        if (err) {
          if (failureCallback) {
            failureCallback(err);
          }
          return;
        }

        // Perform real time accrual, if appropriate
        var workHours = getWorkHoursFromCard(deletedCard);
        if (workHours) {
            // We are to de-accrual the deleted card working hours
            // This is assuming that the hours captures were accrued
            // previously
            workHours = workHours * -1.0;
            TimeoffAccrualService.PerformHourlyAccrual(deletedCard.employee.personDescriptor, workHours);
        }

        if (successCallback) {
            successCallback(deletedCard);
        }
        return;
    });
};

var parsePunchCardWithGeoCoordinate = function(punchCard, success, error) {
  // If coordinates are provided, then decode to human readable address
  var coordinates = _.find(punchCard.attributes, function(attribute) {
    return attribute.name === 'Coordinates';
  });

  var state = _.find(punchCard.attributes, function(attribute) {
    return attribute.name === 'State';
  });

  var city = _.find(punchCard.attributes, function(attribute) {
    return attribute.name === 'City';
  });

  var formattedAddress = _.find(punchCard.attributes, function(attribute) {
    return attribute.name === 'FormattedAddress';
  });

  var addressComponent = _.find(punchCard.attributes, function(attribute) {
    return attribute.name === 'AddressComponent';
  });

  if (coordinates && coordinates.value) {
    LocationService.ReverseGeocodeCoordinate(
      coordinates.value.latitude,
      coordinates.value.longitude,
      function(address) {
        if (state && state.value && state.value != address.state.long_name) {
          error('Location provided does not match existing state value.');
        } else if (city && city.value && city.value != address.city.long_name) {
          error('Location provided does not match existing city value.');
        } else {
          if (!state || !state.value) {
            // Add state
            punchCard.attributes.push({
              'name': 'State',
              'value': address.state.long_name
            });
          }

          if (!city || !city.value) {
            // Add city
            punchCard.attributes.push({
              'name': 'City',
              'value': address.city.long_name
            });
          }

          if (!formattedAddress || !formattedAddress.value) {
            // Add formatted address
            punchCard.attributes.push({
              'name': 'FormattedAddress',
              'value': address.formatted_address
            });
          }

          if (!addressComponent || !addressComponent.value) {
            // Add formatted address
            punchCard.attributes.push({
              'name': 'AddressComponent',
              'value': address.address_component
            });
          }

          success(punchCard);

        }
      },
      function(err) {
        error(err);
      }
    );
  }
  else {
    // if coordinate is not provided, continue the process on success route
    success(punchCard);
  }
};

var getWorkHoursFromCard = function(punchCard) {
    var hours = 0.0;
    var behaviors = TimeCardTypeBehaviors[punchCard.recordType];
    if (behaviors.CountWorkingHours){
      hours = _getCardTimeSpanInHours(punchCard);
      if(behaviors.NegativeValue){
        return -hours;
      }
      else{
        return hours;
      }
    }

    return hours;
};

var _getCardTimeSpanInHours = function(punchCard) {
    if (!punchCard) {
        return null;
    }

    if (punchCard.inProgress) {
        return null;
    }

    var start = moment(punchCard.start);
    var end = moment(punchCard.end);
    var duration = moment.duration(end.diff(start));
    var hours = duration.asHours();

    return hours;
};

var isRecognitionFailed = function(punchCard){
  if (!punchCard){
    return false;
  }
  var threshold = process.env.PunchCardRecognitionConfidenceThreshold || 
    appSettings.defaultPunchCardRecognitionConfidenceThreshold;
  if (punchCard.inProgress && punchCard.checkInAssets && punchCard.checkInAssets.imageDetectionAsset){
    return punchCard.checkInAssets.imageDetectionAsset.confidence < threshold;
  }
  else if (!punchCard.inProgress && punchCard.checkOutAssets && punchCard.checkOutAssets.imageDetectionAsset){
    return punchCard.checkOutAssets.imageDetectionAsset.confidence < threshold;
  }
  return false;
};

var raisePunchCardRecognitionFailedEvent = function(punchCard){
  if (!punchCard){
    console.log("Invalid punch card passed into Raise Event function");
    return;
  }

  if(!(punchCard.checkInAssets && punchCard.checkInAssets.imageDetectionAsset) && 
     !(punchCard.checkOutAssets && punchCard.checkOutAssets.imageDetectionAsset)){
    console.log("PunchCard do not contain imageDetectionAsset!");
    return;
  }
  //Now let's publish the event!
  var event = PunchCardRecognitionFailedEventFactory.BuildEvent(punchCard);
  var topicName = AWSSNSUtilty.GetTopicName(event);
  AWSSNSPublisher.Publish(topicName, event.message);
};

var adjustTimeCardForTimeoffRecord = function(timeoffRecord) {
    if (timeoffRecord.status == TimeoffStatus.Approved) {
        _createTimeCardForApprovedTimeoffRecord(timeoffRecord);
    } else if (timeoffRecord.status == TimeoffStatus.Revoked) {
        _removeTimeCardForRevokedTimeoffRecord(timeoffRecord);
    }
};

var _createTimeCardForApprovedTimeoffRecord = function(timeoffRecord) {
    // For backward compatibility
    if (!timeoffRecord.requestor.companyDescriptor) {
        return;
    }

    var cardToCreate = {
        date: timeoffRecord.startDateTime,
        employee: {  
            email : timeoffRecord.requestor.email,
            firstName: timeoffRecord.requestor.firstName,
            lastName: timeoffRecord.requestor.lastName,
            personDescriptor: timeoffRecord.requestor.personDescriptor,
            companyDescriptor: timeoffRecord.requestor.companyDescriptor
        },
        attributes: [],
        start: timeoffRecord.startDateTime,
        end: TimeoffService.getTimeoffEndDateTime(timeoffRecord),
        inHours: true,
        recordType: _TimeoffTypeToTimeCardTypeMap[timeoffRecord.type],
        inProgress: false,
        references: {
            timeoffRecord: timeoffRecord._id
        }
    };

    createTimeCard(cardToCreate);
};

var _removeTimeCardForRevokedTimeoffRecord = function(timeoffRecord) {
    TimePunchCard
        .find({'references.timeoffRecord': timeoffRecord._id})
        .exec(function(err, timeCards) {
            timeCards.forEach(function(timeCard) {
                deleteTimeCard(timeCard._id);
            });
        });
};

var _TimeoffTypeToTimeCardTypeMap = {};
_TimeoffTypeToTimeCardTypeMap[TimeoffTypes.Pto] = TimeCardTypes.PaidTimeOff;
_TimeoffTypeToTimeCardTypeMap[TimeoffTypes.SickTime] = TimeCardTypes.SickTime;

/****************************************************************************
* Begin Time Punch Card Lunch Hours services
*****************************************************************************/
var _getPunchCardMediumTimeOfDay = function(baseCard){
  var durationInHours = _getCardTimeSpanInHours(baseCard);
  var halfInHours = durationInHours/2;
  return moment(baseCard.start).add(halfInHours, 'hours');
};

var _cloneAttributes = function(fromAttributes){
  var toAttributes = [];
  _.each(fromAttributes, function(attribute){
    toAttributes.push(_.clone(attribute));
  });
  return toAttributes;
};

var CreateBreakTimeCardIfNecessary = function(baseCard){
  var companyId = baseCard.employee.companyDescriptor;
  var personId = baseCard.employee.personDescriptor;
  if(baseCard.inHours ||
     baseCard.inProgress ||
     baseCard.recordType != TimeCardTypes.WorkTime
    ){
    return;
  }
  TimePunchCardSettingService.GetCompanyEmployeeSetting(
    companyId,
    personId,
    function(employeeSetting){
      var setting = employeeSetting.setting;
      if(setting.autoReportBreakTime.active &&
        getWorkHoursFromCard(baseCard) > setting.autoReportBreakTime.breakTimeBaseWorkHours){
        if(baseCard.references.breakCard){
          //If we already have a break card, don't create new one
          return;
        }
        var middleTime = _getPunchCardMediumTimeOfDay(baseCard);
        var breakAddedTime = moment(middleTime).add(setting.autoReportBreakTime.breakTimeLengthHours * 60, 'm');
        var clonedAttributes = _cloneAttributes(baseCard.attributes);
        createTimeCard({
            date: baseCard.date,
            employee: _.clone(baseCard.employee),
            attributes: clonedAttributes,
            start: middleTime,
            end: breakAddedTime,
            inHours: true,
            recordType: TimeCardTypes.BreakTime,
            inProgress: false,
            createdTimestamp: Date.now(),
            updatedTimestamp: Date.now(),
          },
          function(createdCard){
            baseCard.references.breakCard = createdCard._id;
            baseCard.save();
          },
          function(){}
        );
      }
    },
    function(){
      return;
    });
};

var handleUnclosedPunchCards = function(successCallback, failureCallback){
  // Set the checking time limit to be the certain hours the next day in UTC
  var timeCardUnclosedTimeLimit = moment();
  TimePunchCard.find(
    {
      end: null,
      inHours: false,
      recordType: TimeCardTypes.WorkTime,
      start: {$lt: timeCardUnclosedTimeLimit}
    }).exec(function(err, unclosedCards){
      if(err){
        failureCallback(err);
      }
      if(unclosedCards){
        _.each(unclosedCards, function(unclosed){
          //Set the end time to 8 hours later of the card's starting date
          unclosed.end = moment(unclosed.start).add(8, 'h');
          unclosed.systemStopped = true;
          unclosed.inProgress = false;
          unclosed.save();
        });
      }
      successCallback(_.size(unclosedCards));
    });

};

/****************************************************************************
* Time Punch Card Lunch Hours services ends
*****************************************************************************/


module.exports = {
  createTimeCard: createTimeCard,
  updateTimeCard: updateTimeCard,
  deleteTimeCard: deleteTimeCard,
  parsePunchCardWithGeoCoordinate: parsePunchCardWithGeoCoordinate,
  getWorkHoursFromCard: getWorkHoursFromCard,
  isRecognitionFailed: isRecognitionFailed,
  raisePunchCardRecognitionFailedEvent: raisePunchCardRecognitionFailedEvent,
  adjustTimeCardForTimeoffRecord: adjustTimeCardForTimeoffRecord,
  createBreakTimeCardIfNecessary: CreateBreakTimeCardIfNecessary,
  handleUnclosedPunchCards: handleUnclosedPunchCards
};
