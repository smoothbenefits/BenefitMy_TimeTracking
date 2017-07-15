var DateTimeService = require('./DateTimeService');


var TimeoffStatus = {
    // request approved by approver 
    Approved: 'APPROVED',
    // request still pending for action/decision
    Pending: 'PENDING',
    // request got canceled by the requestor 
    Canceled: 'CANCELED',
    // request denied by approver
    Denied: 'DENIED',
    // request previously approved, but then the approval got revoked
    Revoked: 'REVOKED'
};

var TimeoffTypes = {
    Pto: 'Paid Time Off (PTO)',
    SickTime: 'Sick Time'
};

var getTimeoffEndDateTime = function(timeoffRecord) {
    return DateTimeService.computeDateTimeWithTimeSpan(
        timeoffRecord.startDateTime,
        timeoffRecord.duration);
};

module.exports = {
    TimeoffStatus: TimeoffStatus,
    TimeoffTypes: TimeoffTypes,
    getTimeoffEndDateTime: getTimeoffEndDateTime  
};
