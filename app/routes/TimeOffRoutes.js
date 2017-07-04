var emailService = require('../services/EmailService');
var TimeoffAccrualService = require('../services/TimeoffAccrualService');
var Timeoff = require('../models/timeoff');

var TimeoffStatus = {
    Approved: 'APPROVED',
    Pending: 'PENDING',
    Canceled: 'CANCELED',
    Denied: 'DENIED'
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

module.exports = function(app) {

    app.get('/api/v1/timeoffs', function(req, res) {
        Timeoff
        .find()
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
                && status != TimeoffStatus.Denied) {
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
            if (!(status == TimeoffStatus.Approved && timeoff.status == TimeoffStatus.Pending)
                && !(status == TimeoffStatus.Canceled && timeoff.status == TimeoffStatus.Pending)
                && !(status == TimeoffStatus.Denied && timeoff.status == TimeoffStatus.Pending)) {

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
                applyApprovedRequestToBankedBalance(savedTimeoff);

                // Send notification email
                emailService.sendTimeoffDecisionEmail(savedTimeoff);

                res.setHeader('Cache-Control', 'no-cache');
                res.json(savedTimeoff);
            });
        });
    });
};
