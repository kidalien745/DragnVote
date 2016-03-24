var mongoose = require('mongoose');
var CandidateModel = require('../models/candidate').CandidateModel;
var UserModel = require('../models/user').UserModel;
var LocalStrategy = require('passport-local').Strategy;

mongoose.connect('localhost', 'voteDb');
var db = mongoose.connection;

db.on('error', console.error.bind(console, "connection error"));
db.once('open', function () {
    console.log("voteDb is open...");
    CandidateModel.find().exec(function (error, results) {
        if (results.length === 0) {
            CandidateModel.create({ name: "Austin Lien", pictureUrl: "null" });
            CandidateModel.create({ name: "Patty King", pictureUrl: "null" });
            CandidateModel.create({ name: "James Hron", pictureUrl: "null" });
        }
    });
    UserModel.find().exec(function (error, results) {
        if (results.length === 0) {
            var usr = new UserModel({ voterId: "admin", password: "55745p" });
            usr.save(function (err) {
                if (err) {
                    console.log(err);
                }
                else {
                    console.log('user: ' + usr.voterId + ' saved.');
                }
            });
        }
    });
});

module.exports = function (passport) {
    passport.serializeUser(function (user, done) { 
        done(null, user.voterId);
    });
    passport.deserializeUser(function (voterId, done) {
        UserModel.findOne({ voterId: voterId }, function (err, user) { 
            done(err, user);
        });
    });
    passport.use('local-login', new LocalStrategy({
        usernameField : 'voterId',
        passwordField : 'password',
        passReqToCallback : true
    }, function (req, voterId, password, done) {
        process.nextTick(function () {
            UserModel.findOne({ voterId : voterId }, function (err, user) { 
                if (err)
                    return done(err);
                if (!user) {
                    return done(null, false, { message: 'Unknown voter id  ' + voterId });
                }
                user.comparePassword(password, function (err, isMatch) {
                    if (err) return done(err);
                    if (isMatch) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message : 'Invalid password' });
                    }
                })
            })
        })
    }));
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'voterId',
        passwordField : 'password',
        passReqToCallback : true
    }, function (req, voterId, password, done) {
        process.nextTick(function () {
            UserModel.findOne({ voterId : voterId }, function (err, user) { 
                if (err)
                    return done(err);
                if (!user) {
                    return done(null, false, console.log("VoterId not registered.  Something funny happened."));
                } else {
                    user.changePassword("blank", password, function (err2, passwordChanged) {
                        if (err2) return done(err2);
                        if (!passwordChanged)
                            return done(null, false, console.log("Password not changed"));
                        return done(null, user);
                    });
                }
            })
        })
    }));
}