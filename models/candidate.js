var mongoose = require('mongoose');
var candidateSchema = mongoose.Schema({
    name: String,
    pictureUrl: String
});

var CandidateModel = mongoose.model('candidate', candidateSchema);
exports.CandidateModel = CandidateModel;

exports.getAll = function (request, response) {
    CandidateModel.find().exec(function (err, res) {
        if (err) {
            response.send(500, { error: err });
        }
        else {
            response.send(res);
        }
    });
};

exports.getAllInternal = function (callback) {
    CandidateModel.find().exec(function (err, res) {
        if (err) {
            callback(null);
        }
        else {
            callback(res);
        }
    });
}

exports.add = function (request, response) {
    var newCandidate = { name: request.body.name, pictureUrl: request.body.pictureUrl };
    CandidateModel.create(newCandidate, function (addError, addedCandidate) {
        if (addError) {
            response.send(500, { error: addError });
        }
        else {
            response.send({ success: true, candidate: addedCandidate });
        }
    });
};

exports.remove = function (request, response) {
    var candidateName = request.body.name;
    CandidateModel.findOneAndRemove({ name: candidateName }, function (removeError, removedCandidate) {
        if (removeError) {
            response.send(500, { error: removeError });
        }
        else {
            response.send({ success: true });
        }
    });
}