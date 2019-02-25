//----------------------------------------------------Setting configuration----------------------------------------------------------
var express= require("express");
var app = express();
var bodyParser= require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var mongoose=require("mongoose");
var {ObjectID}=require("mongodb");
mongoose.connect("mongodb://localhost/good_reads");

//-----------------------------------------------------Requiring database models------------------------------------------------------
var Author   = require("./models/author");
var Book     = require("./models/book");
var User     = require("./models/user");
var Review   = require("./models/review");
var Category = require("./models/category");
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
    Book.find({},function(err,allBooks){
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
    Book.find({category_id:ObjectID(cat_id)},function(err,foundBooks){
        if(err){
            console.log(err);
            res.send({status:"fail"});
        }
        else{
            console.log(foundBooks);
            res.send({status:"success",books_category:foundBooks});
        }
    })
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

    if(password == re_password)
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
        res.send({status:"fail"});
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















// Adjusting port to listen to
app.listen(process.env.PORT||3000,process.env.IP,function(){
    console.log("DB Server has started");
});
