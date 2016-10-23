var _ = require('underscore');
var moment = require('moment');
var LocationService = require('./LocationService');


var TimeoffTypes = {
    WorkTime: 'Work Time',
    CompanyHoliday: 'Company Holiday',
    PaidTimeOff: 'Paid Time Off',
    SickTime: 'Sick Time',
    PersonalLeave: 'Personal Leave'
};

var splitCrossDatesPunchCard = function(punchCard) {
  var start = moment(punchCard.start);
  var end = moment(punchCard.end);
  var singleDayPunchCards = [];

  var singleDayDurations = splitCrossDateDuration({
    'start': start, 'end': end
  }, []);

  singleDayDurations.forEach(function(duration) {
    var newCard = JSON.parse(JSON.stringify(punchCard));

    newCard.date = duration.startMoment.toDate();
    newCard.start = duration.startMoment.toDate();
    newCard.end = duration.endMoment.toDate();
    singleDayPunchCards.push(newCard);
  });

  return singleDayPunchCards;
};

var splitCrossDateDuration = function(duration, singleDays) {

  if (!duration || !duration.start.isBefore(duration.end)) {
    return singleDays;
  }

  // Get the earliest moment of the next day of start time
  var singleDay;
  var nextDay = duration.start.clone().add(1, 'days').startOf('day');
  if (nextDay.isBefore(duration.end)) {
    singleDay = {
      'startMoment': duration.start.clone(),
      'endMoment': duration.start.clone().endOf('day')
    };
    singleDays.push(singleDay);
  } else {
    singleDay = {
      'startMoment': duration.start.clone(),
      'endMoment': duration.end.clone()
    };
  }

  singleDays.push(singleDay);
  duration.start = nextDay;
  return splitCrossDateDuration(duration, singleDays);
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
            })
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
    if (punchCard.recordType != TimeoffTypes.WorkTime) {
        return 0.0;
    }
    return _getCardTimeSpanInHours(punchCard);
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

module.exports = {
  splitCrossDatesPunchCard: splitCrossDatesPunchCard,
  parsePunchCardWithGeoCoordinate: parsePunchCardWithGeoCoordinate,
  getWorkHoursFromCard: getWorkHoursFromCard
};
