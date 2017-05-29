// Require libraries.
var aws = require("aws-sdk");
var Q = require("q");
var rest = require("restler");
var serverConfig = require("../config/server");

// Create an instance of our SQS Client.
var sqs = new aws.SQS({
    region: serverConfig.aws.region,
    accessKeyId: serverConfig.aws.access_id,
    secretAccessKey: serverConfig.aws.secret_key,

    // For every request in this demo, I'm going to be using the same QueueUrl; so,
    // rather than explicitly defining it on every request, I can set it here as the
    // default QueueUrl to be automatically appended to every request.
    params: {
        QueueUrl: serverConfig.aws.time_accural_queue_url
    }
});

console.log(sqs);

// Proxy the appropriate SQS methods to ensure that they "unwrap" the common node.js
// error / callback pattern and return Promises. Promises are good and make it easier to
// handle sequential asynchronous data.
var receiveMessage = Q.nbind(sqs.receiveMessage, sqs);
var deleteMessage = Q.nbind(sqs.deleteMessage, sqs);

// When pulling messages from Amazon SQS, we can open up a long-poll which will hold open
// until a message is available, for up to 20-seconds. If no message is returned in that
// time period, the request will end "successfully", but without any Messages. At that
// time, we'll want to re-open the long-poll request to listen for more messages. To
// kick off this cycle, we can create a self-executing function that starts to invoke
// itself, recursively.
(function pollQueueForMessages() {

    // Pull a message - we're going to keep the long-polling timeout short so as to
    // keep the demo a little bit more interesting.
    receiveMessage({
        WaitTimeSeconds: 20, // Enable long-polling (3-seconds).
        VisibilityTimeout: 300
    })
    .then(function handleMessageResolve(data) {

        // If there are no message, throw an error so that we can bypass the
        // subsequent resolution handler that is expecting to have a message
        // delete confirmation.
        if (!data.Messages) {
            throw(workflowError("EmptyQueue", new Error("There are no messages to process.")));
        }

        // ---
        // TODO: Actually process the message in some way :P
        // ---
        rest.get("http://localhost:6999/api/v1/timeoff_quotas/execute_accrual")
        .on('complete', function(response) {
          if (response instanceof Error) {
            throw(workflowError("Job", new Error("There are no messages to process.")));
          }
        });


        console.log("Deleting:", data.Messages[0].MessageId);

        // Now that we've processed the message, we need to tell SQS to delete the
        // message. Right now, the message is still in the queue, but it is marked
        // as "invisible". If we don't tell SQS to delete the message, SQS will
        // "re-queue" the message when the "VisibilityTimeout" expires such that it
        // can be handled by another receiver.
        return (deleteMessage({
            ReceiptHandle: data.Messages[0].ReceiptHandle
        }));
    }).catch(function handleError( error ) {
        // The error could have occurred for both known (ex, business logic) and
        // unknown reasons (ex, HTTP error, AWS error). As such, we can treat these
        // errors differently based on their type (since I'm setting a custom type
        // for my business logic errors).
        switch (error.type) {
            case "EmptyQueue":
                console.log("Expected Error: " + error.message);
            break;
            default:
                console.log("Unexpected Error: " + error.message);
            break;
        }
    }).finally(pollQueueForMessages);
})();

// When processing the SQS message, we will use errors to help control the flow of the
// resolution and rejection. We can then use the error "type" to determine how to
// process the error object.
function workflowError(type, error) {
    error.type = type;
    return(error);
};

module.exports = {};
