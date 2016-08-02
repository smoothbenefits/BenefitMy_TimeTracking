var moment = require('moment');

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
  var nextDay = duration.start.clone().add(1, 'days').startOf('day');
  if (nextDay.isBefore(duration.end)) {
    var singleDay = {
      'startMoment': duration.start.clone(),
      'endMoment': duration.start.clone().endOf('day')
    };
    singleDays.push(singleDay);
  } else {
    singleDays.push({
      'startMoment': duration.start.clone(),
      'endMoment': duration.end.clone()
    });
  }

  duration.start = nextDay;
  return splitCrossDateDuration(duration, singleDays);
};

module.exports = {
  splitCrossDatesPunchCard: splitCrossDatesPunchCard
};
