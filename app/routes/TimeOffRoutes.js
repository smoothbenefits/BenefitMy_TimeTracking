var moment = require('moment');
var emailService = require('../services/EmailService');
var TimeoffAccrualService = require('../services/TimeoffAccrualService');
var TimePunchCardService = require('../services/TimePunchCardService');
var Timeoff = require('../models/timeoff');

// For some reason, the destructuring form does not work. We should figure out later
// but not a priority for now.
var TimeoffService = require('../services/TimeoffService');
var TimeoffStatus = TimeoffService.TimeoffStatus;
var TimeoffTypes = TimeoffService.TimeoffTypes;


var applyApprovedRequestToBankedBalance = function(timeoffRequest) {
    if (timeoffRequest.status != TimeoffStatus.Approved) {
        return;
    }

    TimeoffAccrualService.ApplyValueDeltaToBankedBalance(
        timeoffRequest.requestor.personDescriptor,
        timeoffRequest.type,
        -timeoffRequest.duration
    );
};

var applyRevokedRequestToBankedBalance = function(timeoffRequest) {
    if (timeoffRequest.status != TimeoffStatus.Revoked) {
        return;
    }

    TimeoffAccrualService.ApplyValueDeltaToBankedBalance(
        timeoffRequest.requestor.personDescriptor,
        timeoffRequest.type,
        timeoffRequest.duration
    );
};

var applyRequestToBankedBalance = function(timeoffRequest) {
    if (timeoffRequest.status == TimeoffStatus.Approved) {
        applyApprovedRequestToBankedBalance(timeoffRequest);
    } else if (timeoffRequest.status == TimeoffStatus.Revoked) {
        applyRevokedRequestToBankedBalance(timeoffRequest);
    }
};

var getDatesFromParam = function(paramQuery){
    // Start Date
    var startDateParam = paramQuery.start_date;
    var endDateParam = paramQuery.end_date;
    if (startDateParam && endDateParam){
        var dateRange = {
            startDate: moment.utc(startDateParam).startOf('day'),
            endDate: moment.utc(endDateParam).endOf('day')
        };
        return dateRange;
    }
    return null;
};

module.exports = function(app) {

    app.get('/api/v1/requestor/:token/timeoffs', function(req, res) {
        var token = req.params.token;
        Timeoff
        .find({'requestor.personDescriptor':token})
        .sort('requestTimestamp')
        .exec(function(err, timeoffs){
            if (err) {
                res.send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoffs);
        });

    });

    app.get('/api/v1/approver/:token/timeoffs', function(req, res) {
        var token = req.params.token;
        Timeoff
        .find({'approver.personDescriptor':token})
        .sort('requestTimestamp')
        .exec(function(err, timeoffs){
            if (err) {
                res.send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoffs);
        });

    });

    app.post('/api/v1/timeoffs', function(req, res) {

        Timeoff.create(req.body, function(err, createdTimeOff) {
            if (err) {
                res.send(err);
                return;
            }

            // Send notification email
            emailService.sendTimeoffRequestEmail(createdTimeOff);

            res.json(createdTimeOff);
        });
    });

    app.put('/api/v1/timeoffs/:id/status', function(req, res) {
        var id = req.params.id;
        var status = req.body.status;

        Timeoff.findById(id, function (err, timeoff) {

            // Do all the validations here
            if (status != TimeoffStatus.Approved
                && status != TimeoffStatus.Pending
                && status != TimeoffStatus.Canceled
                && status != TimeoffStatus.Denied
                && status != TimeoffStatus.Revoked) {
                res.status(400).send('Specified status is not of valid value.');
                return;
            }

            if (!timeoff) {
                res.sendStatus(404);
                return;
            }

            if (!timeoff.status) {
                res.status(500).send('Timeoff record does not have a status set');
                return;
            }

            // Check state flow validity
            // Valid state changes
            //  * Pending -> Approved
            //  * Pending -> Canceled
            //  * Pending -> Denied
            //
            //  * Approved -> Revoked
            if (!(status == TimeoffStatus.Approved && timeoff.status == TimeoffStatus.Pending)
                && !(status == TimeoffStatus.Canceled && timeoff.status == TimeoffStatus.Pending)
                && !(status == TimeoffStatus.Denied && timeoff.status == TimeoffStatus.Pending)
                && !(status == TimeoffStatus.Revoked && timeoff.status == TimeoffStatus.Approved)) {

                res.status(409).send('Invalid state flow: "' + timeoff.status + '" to "' + status + '"');
                return;
            } 

            timeoff.status = status;
            timeoff.decisionTimestamp = Date.now();
            timeoff.save(function(err, savedTimeoff) {
                if (err) {
                    res.send(err);
                    return;
                }

                // Apply to the user's available balance.
                applyRequestToBankedBalance(savedTimeoff);

                // Send notification email
                emailService.sendTimeoffDecisionEmail(savedTimeoff);

                TimePunchCardService.adjustTimeCardForTimeoffRecord(savedTimeoff);

                res.setHeader('Cache-Control', 'no-cache');
                res.json(savedTimeoff);
            });
        });
    });

    app.post('/api/v1/timeoff/list', function(req, res) {
        // This is the api end point to retrieve a list of time off requests
        // based on posted list of employees (Usually all employees in a company)
        // and the date range specified in the query string
        var dateRange = getDatesFromParam(req.query);
        var employeeIdArray = req.body;
        var filterStatus = req.query.status;

        var searchCriteria = {
            'requestor.personDescriptor': { $in: employeeIdArray},
        };

        if (dateRange){
            searchCriteria['startDateTime'] = {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            };
        }

        if(filterStatus){
            searchCriteria['status'] = filterStatus;
        }

        Timeoff.find(searchCriteria, function(err, timeoffs){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoffs);
        });
    });
};
