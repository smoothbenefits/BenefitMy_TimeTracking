var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var AttributeSchema = new Schema({
    name: { type:String, required: true },
    value: { type:String, required:true }
});

module.exports = AttributeSchema;