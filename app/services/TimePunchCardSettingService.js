var _ = require('underscore');
var TimePunchCardSetting = require('../models/timePunchCardSetting');

var combineSettings = function(companySettingModel, individualSettingModel){
  var combined = _.defaults(
    individualSettingModel.setting,
    companySettingModel.setting);
  return combined;
};

var flattenIndividualWithCompany = function(companySettingModel, individualSettingModel) {
  var combined = combineSettings(companySettingModel, individualSettingModel);
  var cardSetting = _.clone(individualSettingModel);
  cardSetting.setting = combined;
  return cardSetting;
};

var flattenAllIndividualWithCompany = function(companySettingModel, individualSettingModelArray){
  var combinedIndividualSettingsArray = [];
  _.each(individualSettingModelArray, function(individualTimePunchCardSetting){
    var flat = flattenIndividualWithCompany(companySettingModel, individualTimePunchCardSetting);
    combinedIndividualSettingsArray.push(flat);
  });
  return combinedIndividualSettingsArray;
};


var getAllEmployeeSettings = function(companyId, successCallback, failedCallback){
  TimePunchCardSetting.CompanyTimePunchCardSetting
  .findOne({'companyDescriptor': companyId})
  .exec(function(err, companyTimePunchCardSetting){
    if(err){
      failedCallback(err);
    }
    if(!companyTimePunchCardSetting){
      failedCallback('No company setting!');
      return;
    }

    // Convert Mongoose document to a plain object, or underscore
    // functions might not work. e.g. _.clone returns undefined...
    companyTimePunchCardSetting = companyTimePunchCardSetting.toObject();

    TimePunchCardSetting.IndividualTimePunchCardSetting
    .find({'companyDescriptor': companyId})
    .exec(function(err, individualTimePunchCardSettingArray){
      var allSettings = {};
      if(err || !individualTimePunchCardSettingArray){
        allSettings.company = companyTimePunchCardSetting;
        successCallback(allSettings);
        return;
      }
      else{
        // Convert Mongoose document to a plain object, or underscore
        // functions might not work. e.g. _.clone returns undefined...
        individualTimePunchCardSettingArray = _.map(individualTimePunchCardSettingArray, function(document) {
            return document.toObject();
        });

        //Combine the individualTimePunchCardSetting with the values from Company
        var flattenedIndividualSettingsArray = flattenAllIndividualWithCompany(
          companyTimePunchCardSetting,
          individualTimePunchCardSettingArray
        );
        allSettings.company = companyTimePunchCardSetting;
        allSettings.employees = flattenedIndividualSettingsArray;
        successCallback(allSettings);
        return;
      }
    });
  });
};

var getCompanyEmployeeSetting = function(companyId, personId, successCallback, failedCallback){
  TimePunchCardSetting.CompanyTimePunchCardSetting
  .findOne({'companyDescriptor': companyId})
  .exec(function(err, companyTimePunchCardSetting){
    if(err){
      failedCallback(err);
    }
    else if(!companyTimePunchCardSetting){
      failedCallback('No Company Setting found');
      return;
    }

    // Convert Mongoose document to a plain object, or underscore
    // functions might not work. e.g. _.clone returns undefined...
    companyTimePunchCardSetting = companyTimePunchCardSetting.toObject();

    TimePunchCardSetting.IndividualTimePunchCardSetting
    .findOne({'personDescriptor': personId})
    .exec(function(err, individualTimePunchCardSetting){
      if (err || !individualTimePunchCardSetting) {
        // If error or no existing record for the given employee
        // create a "blank" record on the fly, merge it with 
        // the company setting to produce a valid return result
        individualTimePunchCardSetting = {
            companyDescriptor: companyId,
            personDescriptor: personId,
            setting: {}
        };
      } else {
        // Convert Mongoose document to a plain object, or underscore
        // functions might not work. e.g. _.clone returns undefined...
        individualTimePunchCardSetting = individualTimePunchCardSetting.toObject();
      }
      var flattenedSetting = flattenIndividualWithCompany(
            companyTimePunchCardSetting,
            individualTimePunchCardSetting); 
      successCallback(flattenedSetting);
      return; 
    });
  });
};

module.exports = {
  CombineSettings: combineSettings,
  FlattenAllIndividualWithCompany: flattenAllIndividualWithCompany,
  GetAllEmployeeSettings: getAllEmployeeSettings,
  GetCompanyEmployeeSetting: getCompanyEmployeeSetting
};
