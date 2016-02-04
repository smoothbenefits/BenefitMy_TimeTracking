module.exports = function(app) {

    // TODO: Cleat this testing code once it is ready
    var sendTestEmail = function() {
        var emailService = require('../services/EmailService')

        var contextData = {
            company: { name: "Alibaba Ltd" }
        };

        emailService.sendSupportEmailWithTemplate(
            ['zhangsiy@hotmail.com'],
            'OMG3',
            'timeoff_request',
            contextData
        );
    };

    app.get('/livecheck', function(req, res) {

        // TODO: Cleat this testing code once it is ready
        sendTestEmail();

        res.setHeader('Cache-Control', 'no-cache');
        res.json({ 'message': 'Service is Live!' });
    });
};
