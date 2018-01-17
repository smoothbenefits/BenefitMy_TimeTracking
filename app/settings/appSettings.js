module.exports = {

    emailConfig : {
        emailHost: 'smtp.sendgrid.net',
        emailHostUser: 'frank.qiu@gmail.com',
        emailHostPassword: 'Shuibian2017',
        emailPort: 587,
        emailUseTls: true,
        appSupportEmailAddress: 'support@workbenefits.me'
    },

    mainAppSiteUrl : 'http://app.workbenefits.me/',

    defaultPunchCardRecognitionConfidenceThreshold: 60,
    // This is the hour of the day when we run the daily job
    // stop all in-progress time cards from accruing hours. For
    // example, if the setting has value of 8, it will get all
    // in progress cards to stop accrue hours at 8 am UTC of the day
    unclosedCardLimitHour: 8
};