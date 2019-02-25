var mongoose= require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');


var userSchema = new mongoose.Schema({

    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    re_password: {type: String, required: true},
    user_book: [{
        book_id: { 
            type: Schema.Types.ObjectId, 
            ref: 'Book' 
        },
        //book_state: String,
        //user_rating: Number 
    }],
    profile_img: { 
        data: Buffer, 
        contentType: String 
    }

});

userSchema.plugin(uniqueValidator);
var User = mongoose.model("User",userSchema);

module.exports= User;