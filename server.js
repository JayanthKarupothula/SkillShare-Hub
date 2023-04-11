var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash');
var path = require('path'),
    fs = require('fs');
var http = require('http');
var multer = require('multer');
var Grid = require('gridfs-stream');
var bodyParser = require('body-parser');

var server = http.createServer(app)


var configDB = require('./config/database.js');

mongoose.connect(configDB.url); 

require('./config/passport')(passport); 

app.configure(function() {

	app.use(express.cookieParser());
	app.use(bodyParser.json());
	app.use(express.static(path.join(__dirname, 'public')));
	app.use('/scripts', express.static(__dirname + '/node_modules/material-design-lite/'));
	app.use('/css', express.static(__dirname + '/public/css/'));
	app.use('/js', express.static(__dirname + '/public/js/'));
	app.use('/images', express.static(__dirname + '/public/images/'));
	app.set('views', __dirname + '/views');
	app.set('uploads', express.static(__dirname + '/uploads'));
	app.engine('html', require('ejs').renderFile);
	app.use(express.session({ secret: 'teachit' })); 
//	app.use(express.bodyParser({uploadDir:'./uploads'}));
	app.use(bodyParser({uploadDir:'./uploads'}));
	app.use(passport.initialize());
	app.use(passport.session()); 
	app.use(flash());
	// app.use(redirectUnmatched);
});

function redirectUnmatched(req,res) {
	res.redirect('/login');
}

require('./config/upload.js')(app,server, multer, mongoose, Grid, fs);
require('./app/routes.js')(app, passport,server, mongoose, Grid, fs); 



server.listen(port);
console.log('Listening  to  port ' + __dirname + port);