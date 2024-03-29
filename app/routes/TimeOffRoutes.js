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

var _getDatesFromParam = function(paramQuery){
    // Start Date
    var dateRange = {};
    var startDateParam = paramQuery.start_date;
    dateRange.startDate = startDateParam
                    ? moment(startDateParam).startOf('day')
                    : moment.utc('1970-01-01').startOf('day');

    var endDateParam = paramQuery.end_date;
    dateRange.endDate = endDateParam
                    ? moment(endDateParam).endOf('day')
                    : moment.utc('2270-01-01').endOf('day');

    return dateRange;
};

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

    app.get('/api/v1/company/:company/timeoffs', function(req, res){
        var company = req.params.company;
        var dateRange = _getDatesFromParam(req.query);
        Timeoff
        .find({
            'requestor.companyDescriptor': company,
            'startDateTime': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        })
        .sort({startDateTime: 'desc'})
        .exec(function(err, timeoffs){
            if(err){
                res.status(400).send(err);
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
                    res.status(400).send(err);
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

    app.put('/api/v1/timeoffs/:id/company', function(req, res){
        var id = req.params.id;
        var company = req.body.requestor.companyDescriptor;

        Timeoff.findById(id, function (err, timeoff) {
            timeoff.requestor.companyDescriptor = company;
            timeoff.save(function(err, savedTimeoff){
                if(err){
                    res.status(400).send(err);
                    return;
                }

                res.setHeader('Cache-Control', 'no-cache');
                res.json(savedTimeoff);
            });
        });
    });
};
