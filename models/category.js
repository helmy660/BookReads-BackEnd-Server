var mongoose= require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');


var categorySchema = new mongoose.Schema({
    name: {type: String, required: true}
});

categorySchema.plugin(uniqueValidator);
var Category = mongoose.model("Category",categorySchema);

module.exports= Category;