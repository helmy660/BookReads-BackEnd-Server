var mongoose= require("mongoose");


var authorSchema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    date_of_birth: Date,
    brief_description: String
});

var Author = mongoose.model("Author",authorSchema);

module.exports= Author;