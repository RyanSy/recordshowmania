require('dotenv').config();
var createError = require('http-errors');
var compression = require('compression');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require('hbs');
var mongoose = require('mongoose');
var db = mongoose.connection;
var mongoDB = process.env.DB_URI;
var session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var store = new MongoDBStore({
  uri: mongoDB,
  collection: 'userSessions'
}, function(error) {
  if (error) { console.log(error); }
});
var indexRouter = require('./routes/index');
var helmet = require('helmet');
var app = express();

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

// db setup
mongoose.connect(mongoDB, {useNewUrlParser: true});
db.on('error', console.error.bind(console, 'connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials/');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(compression());

// session setup
var sess = {
  'secret': '343ji43j4n3jn4jk3n',
  'cookie': {},
  'store': store,
  'resave': false,
  'saveUninitialized': true
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1); // trust first proxy
  sess.cookie.secure = true; // serve secure cookies
}
app.use(session(sess));

app.use('/', indexRouter);

app.use(helmet());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
