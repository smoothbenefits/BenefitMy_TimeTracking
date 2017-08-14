var logEntriesLogger = require('le_node');
var winston = require('winston');
var loggingConfig = require('../../config/logging');

var loggerOptions = {
    level: 'debug',
    transports: [
      new (winston.transports.Console)(),
      new (winston.transports.Logentries)(loggingConfig.logEntriesConfig)
    ]
};

var logger = new winston.Logger(loggerOptions);

var debug = function(message) {
    logger.debug(message);
};

var info = function(message) {
    logger.info(message);
};

var warn = function(message) {
    logger.warn(message);
};

var error = function(message) {
    logger.error(message);
};

module.exports = {
    debug: debug,
    info: info,
    warn: warn,
    error: error,
    winstonLogger: logger
};
