// local authentication
var LocalStrategy    = require('passport-local').Strategy;

// Facebook authentication
// For more details go to https://github.com/jaredhanson/passport-facebook
var FacebookStrategy = require('passport-facebook').Strategy;
var FACEBOOK_APP_ID = "1332760553424096"
var FACEBOOK_APP_SECRET = "db55fe1f1c6e1b42ce20225da5218a88";

// Twitter authentication
// For more details go to https://github.com/jaredhanson/passport-twitter
var TwitterStrategy = require('passport-twitter').Strategy;
var TWITTER_CONSUMER_KEY = "<Insert Your Key Here>";
var TWITTER_CONSUMER_SECRET = "<Insert Your Secret Key Here>";

// Google authentication
// For more details go to https://github.com/jaredhanson/passport-google-oauth
var GOOGLE_CONSUMER_KEY = "351775298957-emfaht0r4o18j83jstbqk634q66a920e.apps.googleusercontent.com";
var GOOGLE_CONSUMER_SECRET = "3tjMmdZ08MUhc2NmUebzAUs1";
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy

var GitHubStrategy = require('passport-github').Strategy;
var GITHUB_CLIENT_ID = "a599dfd9ab146a642b98";
var GITHUB_CLIENT_SECRET = "df279549b04387f2c099889978369a154223b486";

var User = require('../app/models/user');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // deserialized when subsequent requests are made
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use('login', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true 
    },
    function(req, email, password, done) {
       process.nextTick(function() {
            User.findOne({ 'user.email' :  email }, function(err, user) {
                if (err){ return done(err);}
                if (!user)
                    return done(null, false, req.flash('error', 'User does not exist.'));

                if (!user.verifyPassword(password))
                    return done(null, false, req.flash('error', 'Enter correct password'));
               else
                    return done(null, user);
            });
        });

    }));

    passport.use('register', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true 
    },
    function(req, email, password, done) {

        process.nextTick(function() {
       
            if (!req.user) {
                User.findOne({ 'user.email' :  email }, function(err, user) {
            	    if (err){ return done(err);}
                    if (user) {
                        return done(null, false, req.flash('registererror', 'User already exists'));
                    } else {
                    	console.log(req);
                        var newUser            = new User();
						newUser.user.firstname  = req.body.firstname;
						newUser.user.lastname  = req.body.lastname;
                        newUser.user.email     = email;
                        newUser.user.password  = newUser.generateHash(password);
						newUser.user.role	   = req.body.role;
						
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            }

        });
    }));

    passport.use('adminregister', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true 
    },
    function(req, email, password, done) {

        process.nextTick(function() {
       
            if (!req.user) {
                User.findOne({ 'user.email' :  email }, function(err, user) {
                    if (err){ return done(err);}
                    if (user) {
                        return done(null, false, req.flash('registererror', 'Admin already exists'));
                    } else {
                        console.log(req);
                        var newUser            = new User();
                        newUser.user.firstname  = req.body.firstname;
                        newUser.user.lastname  = req.body.lastname;
                        newUser.user.email     = email;
                        newUser.user.password  = newUser.generateHash(password);
                        newUser.user.role      = "admin";
                        
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }

                });
            }

        });
    }));

    passport.use(new LocalStrategy(function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false, { message: 'Incorrect username.' });
        user.comparePassword(password, function(err, isMatch) {
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        });
      });
    }));

    // Use the FacebookStrategy within Passport.
// Strategies in Passport require a `verify` function, which accept
// credentials (in this case, an accessToken, refreshToken, and Facebook
// profile), and invoke a callback with a user object.
    passport.use(new FacebookStrategy({
            clientID: FACEBOOK_APP_ID,
            clientSecret: FACEBOOK_APP_SECRET,
            callbackURL: "http://localhost:8080/auth/facebook/callback",
            profileFields: ['id', 'displayName', 'link', 'photos', 'emails', 'name']
        },
        function(req, accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
                console.log(profile);
                process.nextTick(function () {
                        if (!req.user) {
                    // User.findOne({ 'user.email' :  profile.emails[0].value }, function(err, user) {
                        User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                                    if (err){ return done(err);}
                                    if (user) {
                                        return done(null, user);
                                    } else {
                                        var newUser            = new User();
                                        newUser.user.firstname  = profile.displayName;
                                        newUser.user.email     = profile.emails[0].value;

                                        newUser.save(function(err) {
                                                if (err)
                                                    throw err;
                                            return done(null, newUser);
                                        });
                                    }

                            });
                            } else {
                                var user               = req.user;
                                user.user.firstname = profile.displayName;
                                user.user.email     = profile.emails[0].value;

                            user.save(function(err) {
                                    if (err)
                                        throw err;
                                return done(null, user);
                            });
                        }
                });
        }
    ));

// Use the TwitterStrategy within Passport.
// Strategies in passport require a `verify` function, which accept
// credentials (in this case, a token, tokenSecret, and Twitter profile), and
// invoke a callback with a user object.
            passport.use(new TwitterStrategy({
                consumerKey: TWITTER_CONSUMER_KEY,
                consumerSecret: TWITTER_CONSUMER_SECRET,
                callbackURL: "http://192.168.1.101:8080/auth/twitter/callback"
        },
        function(req,token, tokenSecret, profile, done) {
    // asynchronous verification, for effect...
                process.nextTick(function () {
      
                     if (!req.user) {
                    User.findOne({ 'user.username' :  profile.displayName }, function(err, user) {
                                    if (err){ return done(err);}
                                    if (user) {
                                        return done(null, user);
                                    } else {
                                        var newUser            = new User();
                            newUser.user.username    = profile.displayName;
                            newUser.user.name   = ''
                            newUser.user.address    = ''

                                        newUser.save(function(err) {
                                                if (err)
                                                    throw err;
                                            return done(null, newUser);
                                        });
                                    }

                            });
                            } else {
                    var user            = req.user;
                    user.user.username    = profile.displayName;
                    user.user.name  = ''
                    user.user.address   = ''

                            user.save(function(err) {
                                    if (err)
                                        throw err;
                                return done(null, user);
                            });
                        }
                });
        }       
    ));

// Use the GoogleStrategy within Passport.
// Strategies in Passport require a `verify` function, which accept
// credentials (in this case, an accessToken, refreshToken, and Google
// profile), and invoke a callback with a user object.
        passport.use(new GoogleStrategy({
                    clientID: GOOGLE_CONSUMER_KEY,
                    clientSecret: GOOGLE_CONSUMER_SECRET,
                    callbackURL: "http://localhost:8080/auth/google/callback"
                },
                function(req, accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
                        process.nextTick(function () {
      
                            if (!req.user) {
                            User.findOne({ 'user.email' :  profile.emails[0].value }, function(err, user) {
                                            if (err){ return done(err);}
                                        if (user) {
                                            return done(null, user);
                                        } else {
                                            var newUser            = new User();
                                            newUser.user.firstname  = profile.displayName;
                                            newUser.user.email     = profile.emails[0].value;

                                            newUser.save(function(err) {
                                                    if (err)
                                                        throw err;
                                                return done(null, newUser);
                                            });
                                        }

                                    });
                                    } else {
                            var user               = req.user;
                                user.user.firstname = profile.displayName;
                                user.user.email     = profile.emails[0].value;
                                    user.save(function(err) {
                                        if (err)
                                            throw err;
                                        return done(null, user);
                            });
                        }
                            });

                }
 
));

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/github/callback"
  },
  function(req, accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
                console.log(profile);
                process.nextTick(function () {
                        if (!req.user) {
                    // User.findOne({ 'user.email' :  profile.emails[0].value }, function(err, user) {
                        User.findOne({ 'githubId' : profile.id }, function(err, user) {
                                    if (err){ return done(err);}
                                    if (user) {
                                        return done(null, user);
                                    } else {
                                        var newUser            = new User();
                                        newUser.user.firstname  = profile.displayName;
                                        newUser.user.email     = profile.emails[0].value;

                                        newUser.save(function(err) {
                                                if (err)
                                                    throw err;
                                            return done(null, newUser);
                                        });
                                    }

                            });
                            } else {
                                var user               = req.user;
                                user.user.firstname = profile.displayName;
                                user.user.email     = profile.emails[0].value;
                            
                                user.save(function(err) {
                                    if (err)
                                        throw err;
                                return done(null, user);
                            });
                        }
                });
        }
  // function(accessToken, refreshToken, profile, cb) {
  //   User.findOrCreate({ githubId: profile.id }, function (err, user) {
  //     return cb(err, user);
  //   });
  // }
));

};