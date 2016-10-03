var rest = require('restler');
var TimeoffQuota = require('../models/timeoffQuota');
var TimeoffAccrualService = require('../services/TimeoffAccrualService');

module.exports = function(app) {

    app.get('/api/v1/person/:descriptor/timeoff_quota', function(req, res) {
        var personDescriptor = req.params.descriptor;
        TimeoffQuota
        .findOne({'personDescriptor':personDescriptor})
        .exec(function(err, timeoffQuota){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoffQuota);
        });
    });

    app.put('/api/v1/person/:descriptor/timeoff_quota', function(req, res){
        var personDescriptor = req.params.descriptor;
        var newModel = req.body

        // Since we are going to use person descriptor as lookup
        // to perform the update, Mongo will complain about "_id"
        // and/or "__v" being presented on the new model, so we
        // have to clear those up.
        delete newModel._id;
        delete newModel.__v;

        newModel.modifiedTimestamp = Date.now();
        TimeoffQuota
        .findOneAndUpdate(
            {'personDescriptor':personDescriptor},
            newModel,
            {upsert:true},
            function(err, updatedModel){
                if (err){
                    res.status(400).send(err);
                    return;
                }
                res.setHeader('Cache-Control', 'no-cache');
                res.json(updatedModel);
            }
        );
    });

    app.get('/api/v1/company/:company/timeoff_quotas', function(req, res){
        var companyDescriptor = req.params.company;
        TimeoffQuota.find({companyDescriptor: companyDescriptor})
        .exec(function(err, timeoffQuotas){
            if (err){
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoffQuotas);
        });
    });

    app.post('/api/v1/timeoff_quotas', function(req, res) {
        var personDescriptor = req.body.personDescriptor;
        var companyDescriptor = req.body.companyDescriptor;
        TimeoffQuota.findOneAndUpdate(
            {
                personDescriptor: personDescriptor,
                companyDescriptor: companyDescriptor
            },
            req.body,
            {new: true, upsert: true},
            function(err, timeoffQuota) {
                if (err) {
                    res.status(400).send(err);
                    return;
                }
                res.json(timeoffQuota);
            });
    });

    app.post('/api/v1/timeoff_quotas/execute_accrual', function(req, res) {
        var messageId = req.body.MessageId;
        var subscribeUrl = req.body.SubscribeURL;

        // Confirm subscribtion to Amazon SNS topic if required
        if (subscribeUrl) {
            rest.get(subscribeUrl).on('complete', function(result) {
              return res.status(201).send(result);
            });
        } else {
          TimeoffAccrualService.ExecuteAccrualForAllRecords();
          return res.status(200).send('Accrual on all records completed! Triggered by message ' + messageId);
        }
    });
};
