var emailService = require('../services/EmailService');
var TimeoffAccrualService = require('../services/TimeoffAccrualService');
var Timeoff = require('../models/timeoff');

var applyApprovedRequestToBankedBalance = function(timeoffRequest) {
    if (timeoffRequest.status != 'APPROVED') {
        return;
    }

    TimeoffAccrualService.ApplyValueDeltaToBankedBalance(
        timeoffRequest.requestor.personDescriptor,
        timeoffRequest.type,
        -timeoffRequest.duration
    );
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

    app.put('/api/v1/timeoffs/:id/status', function(req, res){
        var id = req.params.id;
        var status = req.body.status;
        Timeoff
        .findOneAndUpdate({'_id': id},
                          { $set: { status: status, decisionTimestamp: Date.now()}},
                          {},
                          function(err, timeoff){
            if (err) {
                res.send(err);
                return;
            }

            // Apply to the user's available balance.
            applyApprovedRequestToBankedBalance(timeoff);

            // Send notification email
            emailService.sendTimeoffDecisionEmail(timeoff);

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoff);
        });
    });
};
