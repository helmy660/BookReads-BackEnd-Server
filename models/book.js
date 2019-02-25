var mongoose= require("mongoose");


var bookSchema = new mongoose.Schema({
    name : String , 
    category_id : { 
                    type : mongoose.Schema.Types.ObjectId,
                    ref : "Category"
                },
    auth_id : { 
                   type : mongoose.Schema.Types.ObjectId,
                    ref : "Author"
                },
});

var Book = mongoose.model("Book",bookSchema);

module.exports= Book;