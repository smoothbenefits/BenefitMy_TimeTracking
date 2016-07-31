var moment = require('moment');
var TimePunchCard = require('../models/timePunchCard');

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
                        : moment.utc('2270-01-01').endOf('day');

        return dateRange;
    };

    app.get('/api/v1/employee/:token/time_punch_cards', function(req, res) {
        // Read in filter parameters

        var dateRange = _getDatesFromParam(req.query);

        var employeeId = req.params.token;
        TimePunchCard
        .find({
            'employee.personDescriptor': employeeId,
            'date': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            },
            'inProgress': {'$ne': true}
        })
        .sort('date')
        .exec(function(err, entries){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
            return;
        });
    });

    app.get('/api/v1/company/:token/time_punch_cards', function(req, res){
        var dateRange = _getDatesFromParam(req.query);
        
        var companyToken = req.params.token;
        TimePunchCard
        .find({
            'employee.companyDescriptor': companyToken,
            'date': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            },
            'inProgress': {'$ne': true}
        })
        .sort('employee.personDescriptor')
        .exec(function(err, entries){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
            return;
        });
    });

    app.get('/api/v1/time_punch_cards', function(req, res) {
        var dateRange = _getDatesFromParam(req.query);
        
        TimePunchCard
        .find({
            'date': {
                $gte: dateRange.startDate,
                $lte: dateRange.endDate
            },
            'inProgress': {'$ne': true}
        })
        .sort('employee.personDescriptor')
        .exec(function(err, entries){
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.setHeader('Cache-Control', 'no-cache');
            res.json(entries);
            return;
        });
    });

    app.post('/api/v1/time_punch_cards', function(req, res) {

        TimePunchCard.create(req.body, function(err, createdEntry) {
            if (err) {
                res.status(400).send(err);
                return;
            }

            res.json(createdEntry);
            return;
        });
    });

    app.put('/api/v1/time_punch_cards/:id', function(req, res){
        var id = req.params.id;
        var timePunchCardToUpdate = req.body
        timePunchCardToUpdate.updatedTimestamp = Date.now();
        TimePunchCard
        .findOneAndUpdate(
            {_id:id},
            timePunchCardToUpdate,
            function(err, updatedTimePunchCard){
                if (err){
                    res.status(400).send(err);
                    return;
                }
                res.setHeader('Cache-Control', 'no-cache');
                res.json(updatedTimePunchCard);
                return;
        });
    });

    app.delete('/api/v1/time_punch_cards/:id', function(req, res) {
      var id = req.params.id;

      TimePunchCard.findByIdAndRemove(id, function(err, punchCard) {
        if (err) {
          res.status(404).send(err);
          return;
        }

        res.json({ message: 'Successfully deleted' });
        return;
      });
    });

    app.get('/api/v1/user/:id/time_punch_cards', function(req, res){
      var userId = req.params.id;
      var inProgress = null;
      if (req.query.inprogress === 'true'){
        inProgress = true;
      }

      TimePunchCard
        .find({
          'employee.personDescriptor': userId,
          'inProgress': inProgress
        })
        .exec(function(err, cards){
          if (err) {
              res.status(400).send(err);
              return;
          }

          res.setHeader('Cache-Control', 'no-cache');
          res.json(cards);
        });
    })
};
