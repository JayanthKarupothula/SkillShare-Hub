var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    user             : {
		firstname    : String,
		lastname     : String,
	    email        : String,
	    password     : String,
	    resetPasswordToken: String,
  		resetPasswordExpires: Date,
		role	     : String,
		courses_enrolled : { type : Array , "default" : [] },
		courses_created : { type : Array , "default" : [] },
    paypal_email : String
	}
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.verifyPassword = function(password) {
    return bcrypt.compareSync(password, this.user.password);
};

userSchema.methods.updateUser = function(request, response){

	this.user.name = request.body.name;
	// this.user.address = request.body.address;
	this.user.save();
	response.redirect('/user');
};

userSchema.pre('save', function(next) {
  var user = this;
  var SALT_FACTOR = 5;

  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};


module.exports = mongoose.model('User', userSchema);