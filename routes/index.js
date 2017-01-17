var express = require('express');
var router = express.Router();
var users = require('../models/user');
var votes = require('../models/vote');

module.exports = function(passport) {
    
    router.get('*', function (req, res, next) {
        res.locals.loggedIn = (req.user) ? true : false;
        res.locals.isAdmin = (req.user) ? (req.user.voterId == "admin") ? true : false : false;
        next();
    });

    /* GET home page. */
    router.get('/', function (req, res) {
        res.render('index', { title: 'Express' });
    });
    router.post('/login', passport.authenticate('local-login', {
        successRedirect : '/vote',
        failureRedirect : '/'
    }));
    //router.post('/login', function (req, res, next) {
    //    passport.authenticate('local-login', function (err, user, info) {
    //        if (err) { return next(err) }
    //        return res.redirect('/')
    //    })(req, res, next);
    //});
    
    router.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    router.get('/admin', isLoggedIn, isAdmin, function (req, res) {
        res.render('admin');
    });

    router.post('/ballot', isLoggedIn, votes.update);
    router.get('/ballot', isLoggedIn, votes.get);
    router.get('/ranking', isLoggedIn, isAdmin, votes.getRanking);

    router.get('/register', users.add, function (req, res) {
        var voterId = req.user.voterId;
        res.render('register', { voterId: voterId });
    });
    //router.post('/register', function (req, res, next) {
    //    passport.authenticate('local-signup', function (err, user, info) {
    //        if (err) { return next(err) }
    //        return res.redirect('/register')
    //    })(req, res, next);
    //});
    router.post('/register', passport.authenticate('local-signup', {
        successRedirect : '/vote',
        failureRedirect : '/register'
    }));

    return router;
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

function isAdmin(req, res, next) {
    if (req.user.voterId == 'admin')
        return next();
    res.redirect('/');
}
