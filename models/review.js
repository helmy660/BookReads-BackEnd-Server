var mongoose= require("mongoose");



var reviewSchema = new mongoose.Schema({




});

var Review = mongoose.model("Review",reviewSchema);

module.exports= Review;