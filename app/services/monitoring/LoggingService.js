var logEntriesLogger = require('le_node');

var nodeEnv = process.env.NODE_ENV;

///////////////////////////////////////
// BEGIN: LogEntries Logger
///////////////////////////////////////

// default local options
var leOptions = {
    token: '0a56807a-ad84-4328-8c51-73f80cf463dc',
    console: true,
    minLevel: 'debug',
    flatten: true,
    timeStamp: true,
    withHostname: true,
    withLevel: true,
    withStack: true
};

if (nodeEnv == 'production') {
    leOptions = {
        token: '5ebfa53e-8951-4582-b116-bfe3a41d5a2a',
        console: false,
        minLevel: 'info',
        flatten: true,
        timeStamp: true,
        withHostname: true,
        withLevel: true,
        withStack: true
    };
} else if (nodeEnv == 'staging') {
    leOptions = {
        token: '4fad826f-280d-4f90-9a84-f513a209559f',
        console: false,
        minLevel: 'info',
        flatten: true,
        timeStamp: true,
        withHostname: true,
        withLevel: true,
        withStack: true
    };
} else if (nodeEnv == 'development') {
    leOptions = {
        token: 'ff327dc3-cd99-4d73-bfa7-d8dfbf0e0b49',
        console: false,
        minLevel: 'info',
        flatten: true,
        timeStamp: true,
        withHostname: true,
        withLevel: true,
        withStack: true
    };
}

var leLogger = new logEntriesLogger(leOptions);

///////////////////////////////////////
// END: LogEntries Logger
///////////////////////////////////////

var debug = function(message) {
    leLogger.debug(message);
};

var info = function(message) {
    leLogger.info(message);
};

var warning = function(message) {
    leLogger.warning(message);
};

var error = function(message) {
    leLogger.err(message);
};

module.exports = {
    debug: debug,
    info: info,
    warning: warning,
    error: error
};