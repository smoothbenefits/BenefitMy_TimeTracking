var TimeoffQuota = require('../models/timeoffQuota');

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

    app.post('/api/v1/timeoff_quota', function(req, res) {
        var descriptor = req.body.personDescriptor;
        req.body.modifiedTimestamp = new Date();
        TimeoffQuota.findOneAndUpdate(   
            {personDescriptor: descriptor},
            req.body,
            {new: true, upsert: true},
            function(err, timeoffQuota) {
                if (err) {
                    res.status(400).send(err);
                }
                res.json(timeoffQuota);
            });
    });
};