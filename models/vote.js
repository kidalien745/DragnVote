var mongoose = require('mongoose');
var voteSchema = mongoose.Schema({
    voterId: String,
    ballot: [String],
    lastUpdated: Date
});

voteSchema.pre('save', function (next) {
    now = new Date();
    this.lastUpdated = now;
    next();
});

var VoteModel = mongoose.model('vote', voteSchema);
exports.VoteModel = VoteModel;

exports.get = function (request, response) {
    var voterId = request.user.voterId;
    VoteModel.findOne({ voterId: voterId }, 'voterId ballot', function (err, vote) {
        if (err) {
            console.log("Error finding vote");
            response.send(500, { error: err });
        }
        if (!vote) {
            console.log("No vote on file for voterId");
            response.send({ success: false });
        } else {
            console.log("Vote found for voterId");
            response.send({ success: true, ballot: vote.ballot });
        }
    });
};

exports.update = function (request, response) {
    var voterId = request.user.voterId;
    var ballot = request.body.ballot;
    VoteModel.findOne({ voterId: voterId }, 'voterId ballot', function (err, vote) {
        if (err) {
            console.log("Error finding vote");
            response.send(500, { error: err });
        }
        if (!vote) {
            var newVote = { voterId: voterId, ballot: ballot };
            VoteModel.create(newVote, function (addErr, addedVote) {
                if (addErr) {
                    console.log("Error inserting new vote");
                    response.send(500, { error: addErr });
                } else {
                    console.log("New vote added");
                    response.send({ success: true, ballot: ballot });
                }
            });
        } else {
            vote.ballot = ballot;
            vote.save(function(errSave) {
                if(errSave) console.log("Error saving");
                else console.log("New ballot saved");
            });
            response.send({ success: true, ballot: ballot });
        }
    });
};
