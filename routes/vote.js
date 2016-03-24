var express = require('express');
var router = express.Router();

module.exports = function (passport) {
    /* GET vote page */
    router.get('/', isLoggedIn, function (req, res) {
        res.render('vote');
    });

    return router;
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}