var AWS = require('aws-sdk');
AWS.config.update({region: 'us-west-2'});

var Publish = function(event) {
  var SNSClient = new AWS.SNS({apiVersion: '2010-03-31'});
  var params = {
    Name: event.topicName,
  };
  //First, ensure the topic we are publishing the event to is created
  SNSClient.createTopic(params, function(err, data){
    if(err){
      console.log(err, err.stack); // an error occurred
    }
    else{
      var arn = data.TopicArn;
      var params = {
        Message: JSON.stringify(event.message),
        TopicArn: arn
      };
      SNSClient.publish(params, function(err, data) {
        if (err){
          console.log(err, err.stack); // an error occurred
        } 
        else {
          // successful response
          return data;
        }               
      });
    }
  });
};

module.exports = {
    Publish: Publish
};
