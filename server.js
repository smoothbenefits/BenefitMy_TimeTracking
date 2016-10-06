// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');
var fs			       = require('fs');

// configuration ===========================================

// config files
var db = require('./config/db');
var serverConfig = require('./config/server');

// set our port
var port = process.env.PORT || serverConfig.port;

// connect to our mongoDB database
// (uncomment after you enter in your own credentials in config/db.js)
mongoose.connect(db.url);

// get all data/stuff of the body (POST) parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  next();
});

// set the static files location
app.use(express.static(__dirname + '/public'));

// expose the bower components for easy references
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

// routes ==================================================
var routesPath = __dirname + '/app/routes';
var routesFiles = fs.readdirSync(routesPath);
routesFiles.forEach(function (file) {
  require(routesPath + '/' + file)(app)
});

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('PTO Service is listening on port ' + port);

// Require libraries.
var aws = require("aws-sdk");
var Q = require("q");

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
        WaitTimeSeconds: 25, // Enable long-polling (3-seconds).
        VisibilityTimeout: 300
    })
    .then(function handleMessageResolve(data) {

        // If there are no message, throw an error so that we can bypass the
        // subsequent resolution handler that is expecting to have a message
        // delete confirmation.
        if (!data.Messages) {
            throw(workflowError("EmptyQueue", new Error( "There are no messages to process." )));
        }

        // ---
        // TODO: Actually process the message in some way :P
        // ---
        console.log("Deleting:", data.Messages[0].MessageId);

        // Now that we've processed the message, we need to tell SQS to delete the
        // message. Right now, the message is still in the queue, but it is marked
        // as "invisible". If we don't tell SQS to delete the message, SQS will
        // "re-queue" the message when the "VisibilityTimeout" expires such that it
        // can be handled by another receiver.
        return (deleteMessage({
            ReceiptHandle: data.Messages[0].ReceiptHandle
        }));
    }).then(function handleDeleteResolve(data) {
        console.log("Message Deleted!");
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

// expose app
exports = module.exports = app;
