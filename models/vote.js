var cands = require('../models/candidate');
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

exports.getRanking = function (request, response) {
    VoteModel.find().exec(function (err, votes) {
        if (err) {
            console.log("Error finding ballots");
            response.send(500, { error: err });
        }
        else {
            var numBallots = votes.length;
            cands.getAllInternal(function (candidates) {
                var rankings = {};
                rankings['ballots'] = {};
                var matchups = {};
                for (var i = 0, len = candidates.length; i < len; i++) {
                    rankings['ballots'][candidates[i]['name']] = [];
                }
                var sortedCands = Object.keys(rankings['ballots']).sort();
                var combs = k_combinations(sortedCands, 2);
                for (var i = 0, len = combs.length; i < len; i++) {
                    matchups[combs[i].join('|')] = [];
                }
                for (var i = 0; i < numBallots; i++) {
                    var ballot = votes[i].ballot;
                    for (var rank = 0, len = ballot.length; rank < len; rank++) {
                        var names = ballot[rank].split(" / ");
                        for (var j = 0, len2 = names.length; j < len2; j++) {
                            rankings['ballots'][names[j]].push(rank);
                        }
                    }
                }
                for (var i = 0; i < numBallots; i++) {
                    for (var j in Object.keys(matchups)) {
                        var matchupStr = Object.keys(matchups)[j];
                        var matchup = matchupStr.split('|');
                        var candA = rankings['ballots'][matchup[0]][i];
                        var candB = rankings['ballots'][matchup[1]][i];
                        if (candA < candB)
                            matchups[matchupStr].push(1);
                        else if (candA == candB)
                            matchups[matchupStr].push(0);
                        else
                            matchups[matchupStr].push(-1);
                    }
                }
                var top = [];
                var options = permutations(sortedCands);
                for (var i = 0; i < options.length; i++) {
                    var score = 0;
                    var oMatchups = k_combinations(options[i], 2);
                    for (var j in Object.keys(oMatchups)) {
                        var matchupStr = oMatchups[j].join('|');
                        if (Object.keys(matchups).indexOf(matchupStr) >= 0)
                            score += matchups[matchupStr].filter(function (x) { return x == 1 }).length;
                        else {
                            rMatchup = oMatchups[j].slice(0).reverse();
                            rMatchupStr = rMatchup.join('|');
                            score += matchups[rMatchupStr].filter(function (x) { return x == -1 }).length;
                        }
                    }
                    top.push({ score: score, item: options[i] });
                }
                top = top.sort(function (a, b) { 
                    if (a['score'] > b['score'])
                        return -1;
                    else if (a['score'] == b['score'])
                        return 0;
                    else
                        return 1;
                });
                var topStr = "<pre>" + JSON.stringify(top, null, 2) + "</pre>";
                response.send(topStr);
            });
        }
    });
}

function k_combinations(set, k) {
    var i, j, combs, head, tailcombs;    
    if (k > set.length || k <= 0) {
        return [];
    }
    if (k == set.length) {
        return [set];
    }    
    if (k == 1) {
        combs = [];
        for (i = 0; i < set.length; i++) {
            combs.push([set[i]]);
        }
        return combs;
    }
    combs = [];
    for (i = 0; i < set.length - k + 1; i++) {
        head = set.slice(i, i + 1);
        tailcombs = k_combinations(set.slice(i + 1), k - 1);
        for (j = 0; j < tailcombs.length; j++) {
            combs.push(head.concat(tailcombs[j]));
        }
    }
    return combs;
}

function permutations(inputArr) {
    var results = [];

    function permute(arr, memo) {
        var cur, memo = memo || [];
        for (var i = 0; i < arr.length; i++) {
            cur = arr.splice(i, 1);
            if (arr.length === 0) {
                results.push(memo.concat(cur));
            }
            permute(arr.slice(), memo.concat(cur));
            arr.splice(i, 0, cur[0]);
        }
        return results;
    }
    return permute(inputArr);
}

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
