var _ = require('underscore');
var moment = require('moment');
var LocationService = require('./LocationService');

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

  if (coordinates && coordinates.value) {
    LocationService.ReverseGeocodeCoordinate(
      coordinates.value.latitude,
      coordinates.value.longitude,
      function(address) {
        if (state && state.value && state.value != address.state.long_name) {
          error('Location provided does not match existing state value.');
        } else {
          if (!state || !state.value) {
            // Add state
            punchCard.attributes.push({
              'name': 'State',
              'value': address.state.long_name
            });
          }

          // Add formatted address
          punchCard.attributes.push({
            'name': 'FormattedAddress',
            'value': address.formatted_address
          });

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
}

module.exports = {
  splitCrossDatesPunchCard: splitCrossDatesPunchCard,
  parsePunchCardWithGeoCoordinate: parsePunchCardWithGeoCoordinate
};
