var app = angular.module('voteApp', ['ngTouch', 'as.sortable']);

app.factory('voteCRUD', function ($http, $q) {
    function submitBallot(vote) {
        var deferred = $q.defer();

        $http.post('/ballot', vote).then(function (result) {
            deferred.resolve(result.data.ballot);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getAllCandidates() {
        var deferred = $q.defer();

        $http.get('/candidates').then(function (result) {
            var candidates = [];
            for (var i=0; i<result.data.length; i++)
                candidates.push(result.data[i].name);
            deferred.resolve(candidates);
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    function getCurrentBallot() {
        var deferred = $q.defer();

        $http.get('/ballot').then(function (result) {
            if (result.data.success)
                deferred.resolve(result.data.ballot);
            else {
                getAllCandidates().then(function (candidates) {
                    if (candidates) {
                        deferred.resolve(candidates);
                    }
                    else
                        deferred.resolve(['Error']);
                    return deferred.promise;
                });
            }
        }, function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    return {
        submitBallot: submitBallot,
        getAllCandidates: getAllCandidates,
        getCurrentBallot: getCurrentBallot
    };
});

app.controller('VoteCtrl', function ($scope, voteCRUD) {
    $scope.candidates = [];
    function init() {
        voteCRUD.getCurrentBallot().then(function (candidates) {
            $scope.candidates = candidates;
        }, function (error) {
            console.log(error);
        });
    }

    $scope.submitBallot = function () {
        var ballot = [];
        var length = $scope.candidates.length;
        for (var i=0; i<length; i++) {
            ballot.push($scope.candidates[i]);
        }
        voteCRUD.submitBallot({ voterId: "admin", ballot: ballot }).then(function (newBallot) {
            $scope.candidates = ['Thanks!'];
        }, function (error) {
            console.log(error);
        });
    };

    $scope.resetBallot = function () {
        voteCRUD.getAllCandidates().then(function (candidates) {
            $scope.candidates = candidates;
        }, function (error) {
            console.log(error);
        });
    };

    $scope.merge = function(dir, idx) {
        var candidates = $scope.candidates;
        candidates[idx + dir] = candidates[idx + dir] + ' / ' + candidates[idx];
        candidates.splice(idx, 1);
    };
    
    $scope.sortOptions = {
        itemMoved: function (event) {
            console.log(event);
        },
        orderChanged: function (event) {
            console.log(event);
        }
    };

    init();
});
