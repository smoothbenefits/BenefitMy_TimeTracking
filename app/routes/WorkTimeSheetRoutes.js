var moment = require('moment');
var WorkTimeSheet = require('../models/WorkTimeSheet');

module.exports = function(app) {

    app.get('/api/v1/employee/:token/work_timesheets', function(req, res) {
        // Read in filter parameters

        // Start Date
        var startDateParam = req.query.start_date;
        var startDate = startDateParam
                        ? moment.utc(startDateParam).startOf('day')
                        : moment.utc('1970-01-01').startOf('day');

        var endDateParam = req.query.end_date;
        var endDate = endDateParam
                        ? moment.utc(endDateParam).endOf('day')
                        : moment.utc('2170-01-01').endOf('day');

        var token = req.params.token;
        WorkTimeSheet
        .find({
            'employee.personDescriptor':token,
            'weekStartDate': {
                $gte: startDate,
                $lte: endDate
            }
        })
        .sort('weekStartDate')
        .exec(function(err, entries){
            if (err) {
                res.send(err);
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
        });
    });

    app.post('/api/v1/work_timesheets', function(req, res) {

        WorkTimeSheet.create(req.body, function(err, createdEntry) {
            if (err) {
                res.send(err);
            }

            res.json(createdEntry);
        });
    });
};