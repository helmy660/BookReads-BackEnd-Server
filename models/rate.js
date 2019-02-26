var mongoose= require("mongoose");
var Book     = require("../models/book");
var User     = require("../models/user");


var rateSchema = new mongoose.Schema({
    user_rate: Number,
    book_id : { 
        type : mongoose.Schema.Types.ObjectId,
         ref : "Book"
     },
     user_id : { 
        type : mongoose.Schema.Types.ObjectId,
         ref : "User"
     },
});

var Rate = mongoose.model("Rate",rateSchema);

module.exports= Rate;