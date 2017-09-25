var mongoose = require('mongoose');
var Transaction = require('mongoose-transaction')(mongoose);
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
        var newModel = req.body;

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

    app.get('/api/v1/timeoff_quotas/execute_accrual', function(req, res) {
        TimeoffAccrualService.ExecutePeriodicAccrualForAllRecords();
        return res.status(200).send('Accrual on all records completed!');
    });

    app.put('/api/v1/timeoff_quotas/batch', function(req, res){
        var docCollection = req.body;

        // Initialize a transaction
        var transaction = new Transaction();

        for (var i=0; i < docCollection.length; i++) {
            var doc = docCollection[i];
            if (doc._id) {
                // Update
                var docId = doc._id;
                delete doc._id;
                delete doc.__v;
                doc.modifiedTimestamp = Date.now();
                transaction.update('TimeoffQuota', docId, doc);
            } else {
                // Insert
                transaction.insert('TimeoffQuota', doc);
            }
        }

        // [TODO]:
        // This package seems to have a flaw where this could fail
        // "silently" (i.e. not invoking the callback nor throw) in
        // some cases. E.g. if one of the doc being saved fails the
        // schema validation in some certain ways, such as missing
        // accuralFrequency value.
        transaction.run(function(err, docs){
            if (err) {
                res.status(400).send(err);
                return;
            }
            res.json(docs);
        });
    });
};
