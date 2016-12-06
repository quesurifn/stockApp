var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var io = require('socket.io')(app);
var mongoose = require('mongoose');
var yahooFinance = require('yahoo-finance');
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


//Date parsing for Yahoo Finance API

var now = new Date();

var convertDate = function(date) {
  // year - month - day
  return date.getFullYear() + "-" + getFullMonth()+1 + "-" + date.getDate();
};

var lastYear = function(date) {
  return date.getFullYear()-1 + "-" + getFullMonth()+1 + "-" + date.getDate();
};

var twoYearsAgo = function(date) {
  return date.getFullYear()-2 + "-" + getFullMonth()+1 + "-" + date.getDate();
};

//Routing For Stock Symbols

app.post('/addquotes/:query' function(req, res) {
  //Called from angular form

  req.params.query = req.params.query.toUpperCase();

  yahooFinance.historical({
      symbol: req.params.query,
      from: lastYear,
      to: convertDate(now);


    }, function(err, quotes) {
      if (err) {
        handleError(res, err.message, "Failed to find stocks from Yahoo Finance");

      } else {
        //API Call Successful

        var dataSeries = [];

        for (var i = 0; i < quotes.length; i++) {
          var date = Date.parse(quotes[i].date);

          var object = [date, quotes[i].close]

          dataSeries.push(object);
        } //loop

        var chartData = {

          name: req.params.query,
          data: dataSeries,
          tooltip: {
            valueDecimals:2
          }
        };

        var dbSend = {
          "symbol": req.params.query
        };

        db.collection(Stocks).insertOne(sendDB, function(err, doc){

          if (err) {
            handleError(res, err.message, "Failed to send stock to db")
          } else {
            sendDb = {};
          } // ifelse

        })//DB Collection
      }//else
    } //function err quotes
  }); //yahoo Finance
); //app post

app.get("/removequotes/:query", function(req, res) {
  db.collection(Stocks).deleteOne({"symbol": req.params.query}, function(err, doc){
    if (err){
      handleError(res, err.message, "Failed to remove stock from db");
    } else {
      console.log("Stock Deleted");
    }
  });
});

module.exports = app;
