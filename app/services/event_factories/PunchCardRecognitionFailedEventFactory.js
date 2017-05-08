var EVENT_NAME = 'PunchCardRecognitionFailedEvent';


var BuildEvent = function(punchCard){
  var photoUrl = '';
  if (punchCard.inProgress){
    photoUrl = punchCard.checkInAssets.imageDetectionAsset.realTimeImageAsset.url;
  }
  else{
    photoUrl = punchCard.checkOutAssets.imageDetectionAsset.realTimeImageAsset.url;
  }

  var companyId = punchCard.employee.companyDescriptor;
  var envValue = companyId.substring(0, companyId.indexOf('_'));

  var event = {
    meta:{
      environment: envValue,
      eventName: EVENT_NAME
    },
    message: {
      company_id: punchCard.employee.companyDescriptor,
      user_id: punchCard.employee.personDescriptor,
      in_progress: punchCard.inProgress,
      photo_url: photoUrl,
      created: punchCard.createdTimestamp
    }
  };

  return event;
};

module.exports = {
    BuildEvent: BuildEvent
};
