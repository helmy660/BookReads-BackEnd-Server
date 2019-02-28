var mongoose = require("mongoose");
var Book = require("../models/book");
var User = require("../models/user");


var stateSchema = new mongoose.Schema({
    state: String,
    book_id : { 
        type : mongoose.Schema.Types.ObjectId,
         ref : "Book"
     },
     user_id : { 
        type : mongoose.Schema.Types.ObjectId,
         ref : "User"
     },
});

var State = mongoose.model("State",stateSchema);

module.exports= State;
