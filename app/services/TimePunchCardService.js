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
  parsePunchCardWithGeoCoordinate: parsePunchCardWithGeoCoordinate,
  getWorkHoursFromCard: getWorkHoursFromCard
};
