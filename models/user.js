var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var userSchema = mongoose.Schema( {
    voterId: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

userSchema.methods.changePassword = function (oldPassword, newPassword, cb) {
    var user = this;
    user.comparePassword(oldPassword, function (err, isMatch) { 
        if (err) return cb(err);
        if (isMatch) {
            user.password = newPassword;
            user.save(function (err2) {
                if (err2) return cb(err2);
                return cb(null, true);
            });
        } else {
            return cb(null, false);
        }
    });
}


var UserModel = mongoose.model('user', userSchema);
exports.UserModel = UserModel;

exports.add = function (request, response, next) {
    UserModel.count({}, function (err, count) {
        if (err) {
            request.user = err;
            next();
        }
        var newUser = new UserModel({ voterId: (count + 1).toString(), password: "blank" })
        newUser.save(function (err) {
            if (err) {
                request.user = err;
            }
            else {
                request.user = newUser;
            }
            next();
        });
    });
};
