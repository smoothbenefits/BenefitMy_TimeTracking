// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var mongoose       = require('mongoose');
var fs			       = require('fs');

var winston = require('winston');
var expressWinston = require('express-winston');
var logger = require('./common/monitoring/Logging').winstonLogger;

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

// request logging middleware
expressWinston.requestWhitelist.push('body');
expressWinston.responseWhitelist.push('body');

var requestLoggerMiddleware = expressWinston.logger({
    winstonInstance: logger,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
});
app.use(requestLoggerMiddleware);

// routes ==================================================
var routesPath = __dirname + '/app/routes';
var routesFiles = fs.readdirSync(routesPath);
routesFiles.forEach(function (file) {
  require(routesPath + '/' + file)(app);
});

// exception logging middleware
var errorLoggerMiddleware = expressWinston.errorLogger({
    winstonInstance: logger
});
app.use(errorLoggerMiddleware);

// start app ===============================================
// startup our app at http://localhost:8080
app.listen(port);

// shoutout to the user
console.log('PTO Service is listening on port ' + port);

// expose app
exports = module.exports = app;
