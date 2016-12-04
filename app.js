var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var socketio = require('socket.io');
var mongoose = require('mongoose');
require('./models/model.js');


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, './client')));
app.use(express.static(path.join(__dirname, './client/.tmp')));
app.use(express.static(path.join(__dirname, './client/app')));

//mongoose
mongoose.connect('mongodb://master:1234@ds159737.mlab.com:59737/stockapp');
var db = mongoose.connection;

db.once('open', function(err) {
  if (err) {
    console.log("Database could not be opened" + err);
    return;
  }
    console.log("Database up and running...");
});

db.on('error', function(err) {
  console.log("Database error: " + err);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





module.exports = app;
