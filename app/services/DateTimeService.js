var moment = require('moment');

var DATE_FORMAT_STRING = 'dddd, MMM Do, YYYY';
var DATE_TIME_FORMAT_STRING = 'dddd, MMM Do YYYY, h:mm:ss a';

var getDisplayDate = function(rawDateTime) {
    return moment(rawDateTime).format(DATE_FORMAT_STRING);
};

var getDisplayDateTime = function(rawDateTime) {
    return moment(rawDateTime).format(DATE_TIME_FORMAT_STRING);
};

var computeDateTimeWithTimeSpan = function(startDateTime, spanHours) {
    var start = moment(startDateTime);
    var end = start.add(spanHours, 'hours').toDate();
    return end;
};

module.exports = {
    getDisplayDateTime: getDisplayDateTime,
    getDisplayDate: getDisplayDate,
    computeDateTimeWithTimeSpan: computeDateTimeWithTimeSpan
};