var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');  // authentication
const bodyParser = require('body-parser'); // parser middleware
const axios = require('axios'); // parser middleware

const dotenv = require('dotenv').config();


var indexRouter = require('./routes/index');
var fixturesRouter = require('./routes/fixtures');
var standingsRouter = require('./routes/standings');
var blogRouter = require('./routes/blog');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hjs");
//app.set("view engine", "mustache");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/json', apiRouter);
app.use('/fixtures', fixturesRouter);
app.use('/standings', standingsRouter);
app.use('/blog', blogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.status = err.status;

  // render the error page
  res.status(err.status || 500);
  res.render('error', {err});
});

module.exports = app;
