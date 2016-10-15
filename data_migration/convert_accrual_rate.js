db.timeoffquotas.find({}).forEach(
    function (item) {
        var dirty = false;
        for (i = 0; i < item.quotaInfoCollection.length; i++) {
            var accrualRate = 0.0;

            var quotaEntry = item.quotaInfoCollection[i];
            if (quotaEntry.annualTargetHours == undefined
                || quotaEntry.annualTargetHours == null) {
                continue;
            }
            if (!quotaEntry.accrualSpecs) {
                throw new Error('accrualSpecs');
            } 
            if (quotaEntry.accrualSpecs.accrualFrequency == 'Monthly') {
                accrualRate = (quotaEntry.annualTargetHours / 12.0).toFixed(4);
            } else if (quotaEntry.accrualSpecs.accrualFrequency == 'Daily') {
                accrualRate = quotaEntry.annualTargetHours / 365.0.toFixed(4);
            } else {
                continue;
            }

            // Now mutate the record
            quotaEntry.accrualSpecs.accrualRate = accrualRate;
            delete quotaEntry.annualTargetHours;

            dirty = true;
        }
        if (dirty) {
            db.timeoffquotas.save(item);
        }
    }
);
