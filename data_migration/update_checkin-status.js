db.timepunchcards.update(
  {
    "employee.companyDescriptor": "stage_BMHT_1_b457df460695969e8960e3f1623a3ee7",
    "start": { $gte: new ISODate("2017-06-07T00:00:00Z")}
  },
  {
    $set: { "inProgress": false }
  }
);

db.timepunchcards.find({
    "employee.companyDescriptor": "stage_BMHT_1_b457df460695969e8960e3f1623a3ee7",
    "start": { $gte: new ISODate("2017-06-07T00:00:00Z")}
  });
