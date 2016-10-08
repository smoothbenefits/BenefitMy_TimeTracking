'use strict';

var config = require('../../config/server');
var _ = require('underscore');
var rest = require('restler');

/*
* Get full address from geo coordinate
* Expected latitude and longitude of string type
*/
var ReverseGeocodeCoordinate = function(latitude, longitude, success, error) {
  var googleApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
  rest.get(googleApiUrl, {
          query: {
            'latlng': latitude + ',' + longitude,
            'key': config.google_api_key
          }
        }).on('success', function(response) {
          // Always get the first result from result list
          var result = response.results[0];
          var state = _.find(result.address_components, function(component) {
            return _.contains(component.types, 'administrative_area_level_1');
          });
          var city = _.find(result.address_components, function(component) {
            return _.contains(component.types, 'locality');
          });

          success({
            'formatted_address': result.formatted_address,
            'address_component': result.address_components,
            'city': city,
            'state': state
          });
          return;
        }).on('error', function(err) {
          error(err);
          return;
        });
};

module.exports = {
  ReverseGeocodeCoordinate: ReverseGeocodeCoordinate
};
