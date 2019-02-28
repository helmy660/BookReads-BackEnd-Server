// The purpose of the salt is to prevent database attacks 
//  bcrypt in particular uses a key setup phase
// 

var mongoose= require("mongoose");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;             // how many rounds or iterations the key setup phase uses
var MAX_LOGIN_ATTEMPTS = 5;            // max repeated failure login
var LOCK_TIME = 2 * 60 * 60 * 1000;    // two hours lock


var userSchema = new mongoose.Schema({

    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    re_password: {type: String, required: true},
    user_book: [{
        book_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    }],

    profile_img: {
        data: Buffer,
        contentType: String
    },
    admin: Boolean,
    loginAttempts: { type: Number, required: true, default: 0 },   // will store how many repeated failures
    lockUntil: { type: Number }                                    // will store a timestamp indicating when we may stop ignoring login attempts.
});


// check for a future lockUntil timestamp
userSchema.virtual('isLocked').get(function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});


// hashing the password before saving it into the database
userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) {
        return next();
    }
    else{
        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) {
                return next(err);
            }
            else{
                // hash the password using our new salt
                bcrypt.hash(user.password, salt, function (err, hash) {
                    if (err) {
                        return next(err);
                    }
                    else{
                        // set the hashed password back on our user document
                        user.password = hash;
                        next();
                    }
                });
            }    
        });
    }
});


// compare the given password together
userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        else{
            cb(null, isMatch);
        }
    });
};


//check for user login lock
userSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    else{
        // otherwise we're incrementing
        var updates = { $inc: { loginAttempts: 1 } };
        // lock the account if we've reached max attempts and it's not locked already
        if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
            updates.$set = { lockUntil: Date.now() + LOCK_TIME };
        }
        return this.update(updates, cb);
    }   
};


// expose enum on the model to define Failed Login Reasons
var reasons = userSchema.statics.failedLogin = {
    NOT_FOUND: 0,                // The specified user was not found in the database
    PASSWORD_INCORRECT: 1,       // The provided password was incorrect
    MAX_ATTEMPTS: 2              // The maximum number of login attempts has been exceeded
};


// check authentication
userSchema.statics.getAuthenticated = function(email, password, cb) {
    this.findOne({ email: email }, function(err, user) {
        if (err){
            return cb(err);
        }  
        
        // make sure the user exists
        if (!user) {
            return cb(null, null, reasons.NOT_FOUND);
        }
        
        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err){
                    return cb(err);
                }
                else{
                    return cb(null, null, reasons.MAX_ATTEMPTS);
                }
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err){
                return cb(err);
            }

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err){
                    return cb(err);
                }
                else{
                    return cb(null, null, reasons.PASSWORD_INCORRECT);
                }
            });
        });
    });
};



var User = mongoose.model("User",userSchema);
module.exports= User;
