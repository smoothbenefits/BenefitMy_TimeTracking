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
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(timeoffQuota);
        });
    });

    app.get('/api/v1/company/:company/timeoff_quotas', function(req, res){
        var companyDescriptor = req.params.company;
        TimeoffQuota.find({companyDescriptor: companyDescriptor})
        .exec(function(err, timeoffQuotas){
            if (err){
                res.status(400).send(err);
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
                }
                res.json(timeoffQuota);
            });
    });

    app.get('/api/v1/timeoff_quotas/execute_accrual', function(req, res) {
        TimeoffAccrualService.ExecuteAccrualForAllRecords();
        res.status(200).send('Accrual on all records completed!');
    });
};
