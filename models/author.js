var mongoose= require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var authorSchema = new mongoose.Schema({
    first_name:{type: String, required: true},
    last_name:{type: String, required: true},
    date_of_birth: Date,
    brief_description: String
});

authorSchema.plugin(uniqueValidator);
var Author = mongoose.model("Author",authorSchema);

module.exports= Author;