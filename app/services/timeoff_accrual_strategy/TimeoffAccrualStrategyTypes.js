module.exports = {

    // Strategy of this type is expected to perform accrual
    // on demand in real time, as soon as the triggering events
    // occur.
    // E.g. once a time punch card is logged, the corresponding
    // timeoff accrual should happen in real time 
    RealTime: 'RealTime',

    // Strategy of this type is expected to perform accrual 
    // on a periodic basis, most likely triggered by a recurring
    // demand to capture all accruals that should happen up to 
    // now. 
    // E.g. for daily and monthly accruals, the accruals occur when
    // certain amount of time passed since the last accrual time. 
    Periodic: 'Periodic'
};