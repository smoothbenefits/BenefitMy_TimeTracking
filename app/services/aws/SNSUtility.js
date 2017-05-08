var GetTopicName = function(event){
  return event.meta.environment + '_' + event.meta.eventName;
};

module.exports = {
    GetTopicName: GetTopicName
};
