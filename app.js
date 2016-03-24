var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
//var LocalStrategy = require('passport-local');
//var bcrypt = require('bcryptjs');
//var SALT_WORK_FACTOR = 10;

// login and password stuff

var db = require('./server/database.js')(passport);

// old beginning of file

var routes = require('./routes/index')(passport);
var candidates = require('./routes/candidates');
var vote = require('./routes/vote')(passport);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/angular', express.static(path.join(__dirname, 'node_modules/angular')));
app.use('/angular-touch', express.static(path.join(__dirname, 'node_modules/angular-touch')));
//app.use('/sortable', express.static(path.join(__dirname, 'node_modules/sortablejs')));
app.use('/ng-sortable', express.static(path.join(__dirname, 'node_modules/ng-sortable')));

app.use(session({ secret: 'dragnvoting', saveUninitialized: false, resave: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/candidates', candidates);
app.use('/vote', vote);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;



