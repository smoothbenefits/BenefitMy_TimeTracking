var moment = require('moment');
var WorkTimeSheet = require('../models/WorkTimeSheet');

module.exports = function(app) {

    var _getDatesFromParam = function(paramQuery){
        // Start Date
        var dateRange = {};
        var startDateParam = paramQuery.start_date;
        dateRange.startDate = startDateParam
                        ? moment.utc(startDateParam).startOf('day')
                        : moment.utc('1970-01-01').startOf('day');

        var endDateParam = paramQuery.end_date;
        dateRange.endDate = endDateParam
                        ? moment.utc(endDateParam).endOf('day')
                        : moment.utc('2170-01-01').endOf('day');

        return dateRange;
    };

    app.get('/api/v1/employee/:token/work_timesheets', function(req, res) {
        // Read in filter parameters

        var dateRange = _getDatesFromParam(req.query);

        var token = req.params.token;
        WorkTimeSheet
        .find({
            'employee.personDescriptor':token,
            'weekStartDate': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        })
        .sort('weekStartDate')
        .exec(function(err, entries){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
        });
    });

    app.get('/api/v1/company/:token/work_timesheets', function(req, res){
        var dateRange = _getDatesFromParam(req.query);
        
        var companyToken = req.params.token;
        WorkTimeSheet
        .find({
            'employee.companyDescriptor': companyToken,
            'weekStartDate': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        })
        .sort('weekStartDate')
        .exec(function(err, entries){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
        });
    });

    app.get('/api/v1/work_timesheets', function(req, res) {
        var dateRange = _getDatesFromParam(req.query);
        
        WorkTimeSheet
        .find({
            'weekStartDate': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            }
        })
        .sort('weekStartDate')
        .exec(function(err, entries){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
        });
    });

    app.post('/api/v1/work_timesheets', function(req, res) {

        WorkTimeSheet.create(req.body, function(err, createdEntry) {
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.json(createdEntry);
        });
    });

    app.put('/api/v1/work_timesheets/:id', function(req, res){
        var id = req.params.id;
        var newTimesheet = req.body
        newTimesheet.updatedTimestamp = Date.now();
        WorkTimeSheet
        .findOneAndUpdate(
            {_id:id},
            newTimesheet,
            function(err, updatedTimesheet){
                if (err){
                    res.status(400).send(err);
                    return;
                }
                res.setHeader('Cache-Control', 'no-cache');
                res.json(updatedTimesheet);
        });
    });
};