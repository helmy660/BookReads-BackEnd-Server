var mongoose= require("mongoose");
var Book     = require("./models/book");
var User     = require("./models/user");


var reviewSchema = new mongoose.Schema({
    body: String,
    book_id : { 
        type : mongoose.Schema.Types.ObjectId,
         ref : "Book"
     },
     user_id : { 
        type : mongoose.Schema.Types.ObjectId,
         ref : "User"
     },
});

var Review = mongoose.model("Review",reviewSchema);

module.exports= Review;


    