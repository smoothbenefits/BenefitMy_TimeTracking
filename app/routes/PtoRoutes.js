var Pto = require('../models/pto');

module.exports = function(app) {

    app.get('/api/v1/requestor/:token/ptos', function(req, res) {
        var token = req.params.token;
        Pto
        .find({'requestor.foreignKey':token})
        .sort('timestamp')
        .exec(function(err, ptos){
            if (err) {
                res.send(err);
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(ptos);
        });

    });

    app.get('/api/v1/approver/:token/ptos', function(req, res) {
        var token = req.params.token;
        Pto
        .find({'approver.foreignKey':token})
        .sort('timestamp')
        .exec(function(err, ptos){
            if (err) {
                res.send(err);
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(ptos);
        });

    });

    app.post('/api/v1/pto', function(req, res) {

        Pto.create(req.body, function(err, createdPto) {
            if (err) {
                res.send(err);
            }

            Pto
            .findById(createdPto._id)
            .exec(function(err, pto) {
                if (err) {
                    res.send(err);
                }

                res.setHeader('Cache-Control', 'no-cache');
                res.json(pto);
            });
        });
    
    });
};