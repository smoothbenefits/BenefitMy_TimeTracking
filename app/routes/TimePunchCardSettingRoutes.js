var TimePunchCardSetting = require('../models/timePunchCardSetting');
var TimePunchCardSettingService = require('../services/TimePunchCardSettingService');

module.exports = function(app) {
  app.get('/api/v1/company/:token/time_punch_card_setting', function(req, res) {
      var token = req.params.token;
      TimePunchCardSetting.CompanyTimePunchCardSetting
      .findOne({'companyDescriptor':token})
      .sort('modifiedTimestamp')
      .exec(function(err, companyTimePunchCardSetting){
          if (err) {
              res.status(400).send(err);
              return;
          }
          if(!companyTimePunchCardSetting){
            res.status(404).send();
            return;
          }

          res.setHeader('Cache-Control', 'no-cache');
          res.json(companyTimePunchCardSetting);
      });
  });

  app.post('/api/v1/company/time_punch_card_setting', function(req, res) {
      TimePunchCardSetting.CompanyTimePunchCardSetting
      .create(req.body, function(err, createdTimePunchCardSetting) {
          if (err) {
              res.status(400).send(err);
              return;
          }
          res.setHeader('Cache-Control', 'no-cache');
          res.status(201).json(createdTimePunchCardSetting);
      });
  });

  app.put('/api/v1/company/time_punch_card_setting/:id', function(req, res){
    var id = req.params.id;
    var settingToUpdate = req.body;
    TimePunchCardSetting.CompanyTimePunchCardSetting.findById(
      id, 
      function(err, timePunchCardSetting) {
        if(err){
          res.status(400).send(err);
          return;
        }
        delete settingToUpdate._id;
        delete settingToUpdate.__v;

        TimePunchCardSetting.CompanyTimePunchCardSetting
          .findOneAndUpdate(
            {_id:id},
            settingToUpdate,
            function(error, resultSetting){
              if(error){
                res.status(400).send(error);
                return;
              }
              else{
                res.setHeader('Cache-Control', 'no-cache');
                res.status(200).json(resultSetting);
              }
            }
          );
    });
  });

  app.delete('/api/v1/company/time_punch_card_setting/:id', function(req, res) {
    var id = req.params.id;
      TimePunchCardSetting.CompanyTimePunchCardSetting
      .findByIdAndRemove(id, function(err){
        if(err){
          res.status(404).send(err);
          return;
        }
        else{
          res.setHeader('Cache-Control', 'no-cache');
          res.status(204).send();
        }
      });
  });

  app.get('/api/v1/person/:token/time_punch_card_setting', function(req, res) {
      var token = req.params.token;
      TimePunchCardSetting.IndividualTimePunchCardSetting
      .findOne({'personDescriptor':token})
      .sort('modifiedTimestamp')
      .exec(function(err, individualTimePunchCardSetting){
          if (err) {
              res.status(400).send(err);
              return;
          }

          if(!individualTimePunchCardSetting){
            res.status(404).send();
            return;
          }

          res.setHeader('Cache-Control', 'no-cache');
          res.json(individualTimePunchCardSetting);
      });
  });

  app.post('/api/v1/person/time_punch_card_setting', function(req, res) {
      TimePunchCardSetting.IndividualTimePunchCardSetting
      .create(req.body, function(err, createdTimePunchCardSetting) {
          if (err) {
              res.status(400).send(err);
              return;
          }
          res.setHeader('Cache-Control', 'no-cache');
          res.status(201).json(createdTimePunchCardSetting);
      });
  });

  app.put('/api/v1/person/time_punch_card_setting/:id', function(req, res){
    var id = req.params.id;
    var settingToUpdate = req.body;
    TimePunchCardSetting.IndividualTimePunchCardSetting.findById(
      id, 
      function(err, timePunchCardSetting) {
        if(err){
          res.status(400).send(err);
          return;
        }
        delete settingToUpdate._id;
        delete settingToUpdate.__v;

        TimePunchCardSetting.IndividualTimePunchCardSetting
          .findOneAndUpdate(
            {_id:id},
            settingToUpdate,
            function(error, resultSetting){
              if(error){
                res.status(400).send(error);
                return;
              }
              else{
                res.setHeader('Cache-Control', 'no-cache');
                res.status(200).json(resultSetting);
              }
            }
          );
    });
  });

  app.delete('/api/v1/person/time_punch_card_setting/:id', function(req, res) {
    var id = req.params.id;
      TimePunchCardSetting.IndividualTimePunchCardSetting
      .findByIdAndRemove(id, function(err){
        if(err){
          res.status(400).send(err);
          return;
        }
        else{
          res.setHeader('Cache-Control', 'no-cache');
          res.status(204).send();
        }
      });
  });

  app.get('/api/v1/company/:comp_id/person/:person_id/time_punch_card_setting', function(req, res){
    var compId = req.params.comp_id;
    var personId = req.params.person_id;
    TimePunchCardSettingService.GetCompanyEmployeeSetting(
      compId,
      personId,
      function(allSettings){
        res.json(allSettings);
      },
      function(err){
        res.status(400).send(err);
      }
    );
    
  });

  app.get('/api/v1/company/:comp_id/person/all_time_punch_card_setting', function(req, res){
    var compId = req.params.comp_id;
    TimePunchCardSettingService.GetAllEmployeeSettings(
      compId,
      function(allSettings){
        res.json(allSettings);
      },
      function(err){
        res.status(400).send(err);
      }
    );
  });
};
