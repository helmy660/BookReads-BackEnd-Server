//----------------------------------------------------Setting configuration----------------------------------------------------------
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var morgan = require('morgan');
var {ObjectID} = require("mongodb");
var cors = require("cors");

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var port = process.env.PORT || 3000; // used to create, sign, and verify tokens

//-------------------------------------------------------------Uses-------------------------------------------------------------------
app.use(cors());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.set('superSecret', config.secret); // secret variable

//----------------------------------------------------- DataBase Connection---------------------------------------------------------------
mongoose.connect( process.env.MONGODB_URL || "mongodb://localhost/good_reads");

//-----------------------------------------------------Requiring database models------------------------------------------------------
var Author   = require("./models/author");
var Book     = require("./models/book");
var User     = require("./models/user");
var Review   = require("./models/review");
var Category = require("./models/category");
var Rate = require("./models/rate");
var State= require("./models/state");


//-----------------------------------------------------------Basic routes---------------------------------------------------------------------
app.get('/', function(req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

//-----------------------------------------------------------API routes---------------------------------------------------------------------
// get an instance of the router for api routes
var apiRoutes = express.Router(); 

// route to authenticate a user (POST http://localhost:3000/api/authenticate)
apiRoutes.post('/authenticate', function(req, res) {
  // find the user
  User.findOne({email: req.body.email}, function(err, user) {
    if (err){
        console.log(err);
    }

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } 

    else if (user) {
      // check if password matches
      if (user.password != req.body.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } 
      else {
        // if user is found and password is right
        // create a token with only our given payload
        // we don't want to pass in the entire user since that has the password
        const payload = {
            admin: user.admin     
        };

        var token = jwt.sign(payload, app.get('superSecret'), {
            expiresInMinutes: 1440 // expires in 24 hours
        });
  
        // return the information including token as JSON
        res.json({
            success: true,
            message: 'Enjoy your token!',
            token: token
          });
        } 
      }
  
    });
  });

  
// route middleware to verify a token
apiRoutes.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
  
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('superSecret'), function(err, decoded) {       
          if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });
          } 
          else {
          // if everything is good, save to request for use in other routes
          req.decoded = decoded;         
          next();
          }
      });
  
    } 
    else {
        // if there is no token
        // return an error
        return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});


// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function(req, res) {
    res.json({ message: 'Welcome to the coolest API on earth!' });
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
    User1.find({}, function(err, users) {
      res.json(users);
    });
});

// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);


//Function to delete book , review, state and rate
const book_remove = function(book_id){

    Book.findByIdAndRemove({book_id }, function(err, bookDeleted){
        if (err){
            console.log(err);
            res.send({status:"fail"});
        }
        else {
            console.log(bookDeleted);
            res.send({status:'success',bookDeleted:bookDeleted});
        }
    });

    Review.findByIdAndRemove({book_id }, function(err, reviewDeleted){
        if (err){
            console.log(err);
            res.send({status:"fail"});
        }
        else {
            console.log(reviewDeleted);
            res.send({status:'success',reviewDeleted:reviewDeleted});
        }
    });

    State.findByIdAndRemove({book_id }, function(err, stateDeleted){
        if (err){
            console.log(err);
            res.send({status:"fail"});
        }
        else {
            console.log(stateDeleted);
            res.send({status:'success',stateDeleted:stateDeleted});
        }
    });

    Rate.findByIdAndRemove({book_id }, function(err, rateDeleted){
        if (err){
            console.log(err);
            res.send({status:"fail"});
        }
        else {
            console.log(rateDeleted);
            res.send({status:'success',rateDeleted:rateDeleted});
        }
    });
}


//--------------------------------------------------------------------------------------------------------------------------------------



// --------------------------------------------------------Category routes--------------------------------------------------------------

//Adding new category (need name of the category in the request body from the form)
app.post("/category/add",function(req,res){
    var newCategory= {
        name:req.body.cName
    };

    Category.create(newCategory,function(err,newCat){
        if(err){
            console.log(err);
            res.send({status:"fail"}); // Returning fail message for new category creation
        }
        else{
            console.log(newCat);
            res.send({status:"success"}); // Returning success message for new category creation
        }
    })
});

//Getting all categories
app.get("/category/all",function(req,res){

    Category.find({},function(err,allCategories){
        if(err){
            console.log(err);
            res.send({status:"fail"});

        }
        else{
            console.log(allCategories);
            res.send({status:"success",allCategories:allCategories});
        }
    });
});

//Edit existing category (need category id and the new name of the category)
app.post("/category/edit/:catID",function(req,res){
    var catID=req.params.catID;
    var newName=req.body.name;
    Category.update({_id:catID},{$set: { name: newName }},{upsert: true},function(err){
        if (err){
            console.log("Editing Category details is failed");
            res.send({status:"fail"});
        }
        else{
            res.send({status:"success"});
        }
    });
});


//Delete existing category (need category id)
//Delete related Book,review,rate,user_books
app.post("/category/delete/:catID", function(req, res){
    const catID = req.params.catID;
      Category.findByIdAndRemove({catID}, (err, catDeleted) => {
    if (err){
        console.log(err);
        res.send({status:"fail"});
    }
    else {
        console.log(catDeleted);
        res.send({status:"success",catDeleted:catDeleted});
        Book.findById({category_id: ObjectId(catID)},{$unset: {category_id: 1}},function(err, bookRelated){
          if (err){
            console.log(err);
            res.send({status:"fail"});
          }
          else {
            console.log(bookRelated);
            res.send({status:"success",bookRelated:bookRelated});
            book_remove(bookRelated._id);
          }
        }
      );
    }
  });
});



//------------------------------------------------------------Author routes----------------------------------------------------------------------

//Adding new author (will need fName , lName , dob , brief description)
app.post("/author/add",function(req,res){
    console.log(req.body.fName);
    var newAuth= {
        first_name : req.body.fName ,
        last_name : req.body.lName ,
        date_of_birth : req.body.dob ,
        brief_description : req.body.bd
    };

    Author.create(newAuth,function(err,createdAuth){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(createdAuth);
            res.send({status:"success"});
        }
    });
});

//Edit existing author (will need fName , lName , dob , brief description from the form and author id from req.params )
app.post("/author/edit/:authID",function(req,res){
    var authID=req.params.authID;

    Author.update({_id:authID},{$set: { fisrt_name : req.body.fName  , last_name : req.body.lName ,
                                       date_of_birth : req.body.dob , brief_description : req.body.bd
                                    }},{upsert: true},function(err){
        if (err){
            console.log("Editing Author details is failed");
            res.send({status:"fail"});
        }
        else{
            res.send({status:"success"});
        }
    });
});

//Getting all authors
app.get("/author/all",function(req,res){
    Author.find({},function(err,allAuthors){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(allAuthors);
            res.send({status:"success",allAuthors:allAuthors});
        }
    });
});

//Getting author by id + all of his books

app.get("/author/:author_id",function(req,res){
    let author_id= req.params.author_id;

    Author.findOne({_id:author_id},function(err,foundAuthor){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            Book.find({auth_id : ObjectID(author_id)}).populate("category_id").exec(function(err2,foundBooks){
                if(err2){
                    console.log(err2);
                    res.send({status:"fail"});
                }
                else{
                    res.send({status:"success",author:foundAuthor,author_books:foundBooks});
                }
            });


        }
    })
});

// Delete Author (using _id)
// delete related books, rate, review, state ,
app.post("/author/delete/:authID", function(req, res){
    var authID=req.params.authID;
    Author.findByIdAndRemove({authID }, function(err, authDeleted){
        if (err){
            console.log(err);
            res.send({status:"fail"});
        }
        else {
            console.log(authDeleted);
            res.send({status:"success",authDeleted:authDeleted});
            Book.findOne({ auth_id: ObjectId(authID)}, function(err, foundAuth){
                if (err){
                    console.log(err);
                    res.send({status:"fail"});
                }
                else {
                    console.log(foundAuth);
                    res.send({status:"success",foundAuth:foundAuth});
                    Book.update({auth_id: ObjectId(authID)},{$unset:{authID:1}}, function(err, authRelated){
                        if (err){
                            console.log(err);
                            res.send({status:"fail"});
                        }
                        else {
                            res.send(authRelated);
                        }
                    });
                }
            });
        }
    });
});


//----------------------------------------------------------Book Routes------------------------------------------------------------------

//Adding new book (will require name , category id , auth id from form data)
app.post("/book/add",function(req,res){
    var bName   = req.body.bName;
    var catID   = req.body.catID;
    var authID  = req.body.authID;
    var newBook = {
        name : bName ,
        category_id : catID ,
        auth_id : authID
    };

    Book.create(newBook,function(err,createdBook){
        if (err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(createdBook);
            res.send({status : "success"});
        }
    });
});

//Getting all books
app.get("/book/all",function(req,res){
    Book.find({}).populate("category_id").populate("auth_id").exec(function(err,allBooks){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(allBooks);
            res.send({status:"success",allBooks:allBooks});
        }
    });
});

//Getting all books under specific author id  (will need author id)
app.get("/book/byauthor/:auth_id",function(req,res){
    var auth_id = req.params.auth_id;
    Book.find({auth_id:ObjectID(auth_id)},function(err,foundBooks){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(foundBooks);
            res.send({status:"success",books_author:foundBooks});
        }
    })
});

//Getting all books under specific category id  (will need category id)
app.get("/book/bycategory/:cat_id",function(req,res){
    var cat_id = req.params.cat_id;
    console.log("A7la msa 3ala f5adkom");
    Book.find({category_id:ObjectID(cat_id)}).populate('auth_id').populate('category_id').exec(function(err,foundBooks){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(foundBooks);
            res.send({status:"success",books_category:foundBooks});
        }
    });
});



// Getting all details about specific book (book details , reviews, rates , category, author)
app.get("/book/:book_id",function(req,res){
   let book_id=req.params.book_id;

   Book.findById({_id: book_id}).populate('category_id').populate('auth_id').exec(function(err,foundBook){
    if(err){
        console.log(err);
        res.send({status:"fail"});
    }
    else{

        console.log(foundBook);
        res.send({status:'success',bookData:foundBook});
    }
   });
});



// Delete book (using id)
// Delete relative details from user_books , rate , review , author
app.post("/book/delete/:book_id", function(req, res){
    let book_id=req.params.book_id;
    book_remove(book_id);
});



//------------------------------------------------------Rate Routes-----------------------------------------------------------

 // Update number of rates and average rate for a book when specific user  make rate for first time or edit his rate before
 // will need (user id, book id, user rate)

 app.get("/book/editrate/:book_id/:user_id/:rate",function(req,res){
    let book_id=req.params.book_id;
    let user_id=req.params.user_id;
    let rate = req.params.rate;
//first we need to check review collection which contain all information about user book interaction and see if this has the field user rating
Rate.findOne({book_id : ObjectID(book_id) , user_id:ObjectID(user_id)},function(err,foundRate){
    if(err){
        console.log(err);
        res.send({status:"fail"});
    }
    else {  // No errors
        if(foundRate) {// There is already existed rate for this user and this book
                       // So we will not increase this book number of rates
                       // Just update the rate then update this book average rating
            console.log(foundRate);
            foundRate.user_rate=rate;
            foundRate.save(function(err2,updatedRate){
                if(err2){
                    console.log(err2);
                    res.send({status:"fail"});
                }
                else{
                    console.log(updatedRate); // Saving is done successfully now we need to update book avg rate
                                              // need to sum all user rates then divide by num of rates
                    let totalRates=0; // total rates for this book
                    Rate.find({book_id : ObjectID(book_id)},function(err3,foundRates2){
                        if(err3){
                            console.log(err3);
                            res.send({status:"fail"});
                        }
                        else{ // Now we get all rate documents containing this book for different users

                            for (let i=0;i<foundRates2.length;i++){
                                totalRates= totalRates+ foundRates2[i].user_rate;
                            }
                        // Now we should update book avg rate
                           Book.findOne({_id: ObjectID(book_id)},function(err4,foundBook){
                               if(err4){
                                   console.log(err4);
                                   res.send({status:"fail"});
                               }
                               else{
                                   foundBook.avg_rate= totalRates/foundBook.no_of_rates;
                                   foundBook.save(function(err5){
                                       if(err5){
                                           console.log(err5);
                                           res.send({status:"fail"});
                                       }
                                       else{
                                           res.send({status:"success"});
                                       }
                                   });
                               }
                           });
                        }
                    });
                }
            });
        }
        else{         // There is no rate for this user for this book
                      // so we will need to add document this user id and book id
                      // also we will need to increase the number of rates then update this book avg rate
            Rate.create({user_rate: rate, book_id : ObjectID(book_id), user_id : user_id},function(err2,createdRate){
                if (err2){
                    console.log(err2);
                    res.send({status:"fail"});
                }
                else{ // document created successfully now we need to update number of rates and avg rate for this book
                    Book.findOne({_id: ObjectID(book_id)},function(err3,foundBook){
                        if(err3){
                            console.log(err3);
                            res.send({status:"fail"});
                        }
                        else{  // now we have this book and need to update its no_rates and avg_rates
                            //foundBook.no_of_rates++;
                            if (foundBook.no_of_rates)
                                 foundBook.no_of_rates= foundBook.no_of_rates +1;
                            else
                                 foundBook.no_of_rates=1;

                            foundBook.save(function(err4,updatedBook){
                                if(err4){
                                    console.log(err4);
                                    res.send({status:"fail"});
                                }
                                else{ // book no_rates updated successfully
                                    Rate.find({book_id : ObjectID(book_id)},function(err5,foundRates2){
                                        if(err5){
                                            console.log(err5);
                                            res.send({status:"fail"});
                                        }
                                        else{ // Now we get all rate documents containing this book for different users
                                            let totalRates=0;
                                            for (let i=0;i<foundRates2.length;i++){
                                                totalRates= totalRates+ foundRates2[i].user_rate;
                                            }
                                        // Now we should update book avg rate
                                           Book.findOne({_id: ObjectID(book_id)},function(err6,foundBook){
                                               if(err6){
                                                   console.log(err6);
                                                   res.send({status:"fail"});
                                               }
                                               else{
                                                   foundBook.avg_rate= totalRates/foundBook.no_of_rates;
                                                   foundBook.save(function(err5){
                                                       if(err5){
                                                           console.log(err5);
                                                           res.send({status:"fail"});
                                                       }
                                                       else{
                                                           res.send({status:"success"});
                                                       }
                                                   });
                                               }
                                           });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    }
})
});

//-------------------------------------------------------Review Routes--------------------------------------------------------

// Get reviews for specific book (will need book id in req.params)   (Not tested yet)
app.get("/review/bybook/:book_id",function(req,res){
    var book_id = req.params.book_id;
    Review.find({book_id:ObjectID(book_id)}).populate("user_id").exec(function(err,foundReviews){
        if(err){
                    console.log(err);
                    res.send({status:"fail"});
                }
                else{
                    console.log(foundReviews);
                    res.send({status:"success",bookReviews:foundReviews});
                }
    });
});

//Submit review for specific user for specific book (will need book id and user id in req.params also review body from the form)
app.post("/review/add/:book_id/:user_id",function(req,res){
    var book_id = req.params.book_id;
    var user_id = req.params.user_id;
    var review_body= req.body.review_body;
    Review.create({body:review_body,book_id : ObjectID(book_id),user_id : ObjectID(user_id)},function(err,review){
        if (err){
          console.log(err);
          res.send({status:"fail"});
      }
      else{
          console.log(review);
          res.send({status:"success"});
      }
  });
});


//------------------------------------------------------------User routes----------------------------------------------------------------------

//Adding new user (will need fName , lName , email , passwd , re_passwd, profileImg)

app.post("/user/add",function(req,res){
    var newUser = {
        first_name : req.body.fName,
        last_name : req.body.lName,
        email : req.body.email,
        password : req.body.passwd,
        re_password: req.body.re_passwd
    };

    if(newUser.password == newUser.re_password)
    {
        User.create(newUser,function(err,createdUser){
            if(err) {
                console.log(err);
                res.send({status:"fail"});
            }
            else {
                console.log(createdUser);
                res.send({status:"success"});
            }
        });
    }

    else {
        console.log("The password doesn't match");
        res.send({status:"fail",msg:"The password doesn't match retype pass word"});
    }

});


//Edit existing user (will need fName , lName , email , passwd from the form and user id from req.params )
app.post("/user/edit/:userID",function(req,res){
    var userID=req.params.userID;

    User.update({_id:userID},{$set: { fisrt_name : req.body.fName  , last_name : req.body.lName ,
                                       email : req.body.email , password : req.body.passwd
                                    }},{upsert: true},function(err){
        if (err){
            console.log("Editing User details is failed");
            res.send({status:"fail"});
        }
        else{
            res.send({status:"success"});
        }
    });
});

//Getting all users
app.get("/user/all",function(req,res){
    User.find({},function(err,allUsers){
        if(err){

            console.log(err);
            res.send({status:"fail"});
        }
        else{

            console.log(allUsers);
            res.send({status:"success",allUsers:allUsers});
        }
    });
});


//------------------------------------------------------------State routes----------------------------------------------------------------------

// Edit book state for specific user (will need user id and book id in req.params)   (Not tested yet)
app.get("/state/:bookState/:bookID/:userID",function(req,res){
    var bookID = req.params.bookID;
    var userID = req.params.userID;
    var bookState =  req.params.bookState;


    State.findOne({book_id: ObjectID(bookID) , user_id: ObjectID(userID)},function(err,getState){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            if(getState) { // This state exists for this user and this book
                           // need to change just the state
                getState.state = bookState;
                getState.save(function(err,d) {
                    if(err) {
                        console.log(err);
                        res.send({status:"fail"});
                    }
                    else {
                        res.send({status:"success"});
                    }
                });
            }

            else { // There is no state for this user and this book
                   // need to create this state and push this book to this user book list
                State.create({state:bookState , book_id: ObjectID(bookID) , user_id: ObjectID(userID)},function(err,review){
                    if (err){
                        res.send({status:"fail"});
                    }
                    else { // state created successfully
                           // now we need to push this book for this user book list
                        console.log(getState);
                        User.findOne({_id:userID},function(err,foundUser){
                            if(err) {
                                console.log(err);
                                res.send({status:"fail"});
                            }
                            else { //now pushing
                               foundUser.user_book.push(ObjectID(bookID));
                               foundUser.save(function(err){
                                if (err){
                                    res.send({status:"fail"});
                                }
                                else
                                res.send({status:"success"});
                               });
                            }
                        });
                    }
                });
            }
        }
    });
});



// Adjusting port to listen to
app.listen(process.env.PORT||3000,process.env.IP,function(){
    console.log("DB Server has started");
});
