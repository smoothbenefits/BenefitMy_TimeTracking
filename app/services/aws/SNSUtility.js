var EVENT_NAME = 'PunchCardRecognitionFailedEvent';

var GetTopicName = function(punchCard){
  var companyId = punchCard.employee.companyDescriptor;
  var environment = companyId.substring(0, companyId.indexOf('_'));
  return environment + '_' + EVENT_NAME;
};

module.exports = {
    GetTopicName: GetTopicName
};
