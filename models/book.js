var mongoose= require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var bookSchema = new mongoose.Schema({
    name : {type: String, required: true}, 
    category_id : { 
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "Category"
                },
    auth_id : { 
                   type : mongoose.Schema.Types.ObjectId,
                    ref : "Author"
                },
});

bookSchema.plugin(uniqueValidator);
var Book = mongoose.model("Book",bookSchema);

module.exports= Book;