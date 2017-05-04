var EVENT_NAME = 'PunchCardRecognitionFailedEvent';

var _getTopicName = function(punchCard){
  var companyId = punchCard.employee.companyDescriptor;
  var environment = companyId.substring(0, companyId.indexOf('_'));
  return environment + '_' + EVENT_NAME;
};

var _getMessage = function(punchCard){
  var photoUrl = '';
  if (punchCard.inProgress){
    photoUrl = punchCard.checkInAssets.imageDetectionAsset.realTimeImageAsset.url;
  }
  else{
    photoUrl = punchCard.checkOutAssets.imageDetectionAsset.realTimeImageAsset.url;
  }
  var message = {
    company_id: punchCard.employee.companyDescriptor,
    user_id: punchCard.employee.personDescriptor,
    in_progress: punchCard.inProgress,
    photo_url: photoUrl,
    created: punchCard.createdTimestamp
  };

  return message;
};


var CreateEvent = function(punchCard){
  return {
    topicName: _getTopicName(punchCard),
    message: _getMessage(punchCard)
  };
};

module.exports = {
    CreateEvent: CreateEvent
};
