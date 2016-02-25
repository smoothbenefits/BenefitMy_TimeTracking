var cursor = db.timeoffquotas.find({personDescriptor:{$eq:'localhost_BMHT_80_c3cb1983bf810b3d39ed44ed3dbd50ce'}});
if (!cursor.hasNext()){
    var result = db.timeoffquotas.save({
        personDescriptor:'localhost_BMHT_80_c3cb1983bf810b3d39ed44ed3dbd50ce',
        quota: {
            sickTimeInHours: 30,
            paidTimeOffInHours: 120
        },
        createdTimestamp: new Date()
    });

    printjson(result);
}
else{
    print('quota with personDescriptor localhost_BMHT_80_c3cb1983bf810b3d39ed44ed3dbd50ce already exists');
    printjson(cursor.next());
}