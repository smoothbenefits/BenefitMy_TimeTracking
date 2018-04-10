var _ = require('underscore');
var TimePunchCardSetting = require('../models/timePunchCardSetting');

var combineSettings = function(companySettingModel, individualSettingModel){
  var combined = {};
  combined.autoReportFullWeek = _.defaults(individualSettingModel.setting.autoReportFullWeek,
    companySettingModel.setting.autoReportFullWeek);
  combined.autoReportBreakTime = _.defaults(individualSettingModel.setting.autoReportBreakTime,
    companySettingModel.setting.autoReportBreakTime);
  combined.holidayEntitled = _.defaults(individualSettingModel.setting.holidayEntitled,
    companySettingModel.setting.holidayEntitled);
  return combined;
};

var flattenAllIndividualWithCompany = function(companySettingModel, individualSettingModelArray){
  var combinedIndividualSettingsArray = [];
  _.each(individualSettingModelArray, function(individualTimePunchCardSetting){
    var combined = combineSettings(companySettingModel, individualTimePunchCardSetting);
    var cardSetting = _.clone(individualTimePunchCardSetting);
    cardSetting.setting = combined;
    combinedIndividualSettingsArray.push(cardSetting);
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
    TimePunchCardSetting.IndividualTimePunchCardSetting
    .find({'companyDescriptor': companyId})
    .exec(function(err, individualTimePunchCardSettingArray){
      var allSettings = {};
      if(err || !individualTimePunchCardSettingArray){
        if(!companyTimePunchCardSetting){
          failedCallback('No company setting!');
          return;
        }
        else{
          allSettings.company = companyTimePunchCardSetting;
          successCallback(allSettings);
          return;
        }
      }
      else{
        if(!companyTimePunchCardSetting){
          failedCallback('Individual Setting Available while company has none');
          return;
        }
        else{
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
    TimePunchCardSetting.IndividualTimePunchCardSetting
    .findOne({'personDescriptor': personId})
    .exec(function(err, individualTimePunchCardSetting){
      if(err || !individualTimePunchCardSetting){
        if(!companyTimePunchCardSetting){
          failedCallback('No Company Setting found');
          return;
        }
        else{
          successCallback(companyTimePunchCardSetting.setting);
          return;
        }
      }
      else{
        if(!companyTimePunchCardSetting){
          failedCallback('Individual Setting Available while company has none');
          return;
        }
        else{
          //Combine the individualTimePunchCardSetting with the values from Company
          var flattenedSetting = combineSettings(
            companyTimePunchCardSetting,
            individualTimePunchCardSetting
          );
          successCallback(flattenedSetting);
          return;
        } 
      }
    });
  });
};

module.exports = {
  CombineSettings: combineSettings,
  FlattenAllIndividualWithCompany: flattenAllIndividualWithCompany,
  GetAllEmployeeSettings: getAllEmployeeSettings,
  GetCompanyEmployeeSetting: getCompanyEmployeeSetting
};
