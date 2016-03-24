var app = angular.module('candidatesApp', []);

app.factory('candidatesCRUD', function ($http, $q) {
    function getAllCandidates() {
        var deferred = $q.defer();

        $http.get('/candidates').then(function (result) {
            deferred.resolve(result.data);
        }, function (error) { 
            deferred.reject(error);
        });

        return deferred.promise;
    }
    
    function addCandidate(newCandidate) {
        var deferred = $q.defer();

        $http.post('/candidates/add', newCandidate).then(function (result) { 
            deferred.resolve(result.data.candidate);
        }, function (error) { 
            deferred.reject(error);
        });

        return deferred.promise;
    }
    
    function removeCandidate(candidate) {
        var deferred = $q.defer();

        $http.post('/candidates/remove', candidate).then(function (result) {
            deferred.resolve(result.data.candidate);
        }, function (error) { 
            deferred.reject(error);
        });

        return deferred.promise;
    }

    return {
        getAllCandidates: getAllCandidates,
        addCandidate: addCandidate,
        removeCandidate: removeCandidate
    };
});

app.controller('CandidatesCtrl', function ($scope, candidatesCRUD) {
    function init() {
        candidatesCRUD.getAllCandidates().then(function (candidates) {
            $scope.candidates = candidates;
        }, function (error) {
            console.log(error);
        });
    }
    
    $scope.addCandidate = function () {
        candidatesCRUD.addCandidate({ name: $scope.newCandidateName, pictureUrl: $scope.newCandidatePictureUrl }).then(function (newCandidate) {
            $scope.candidates.push(newCandidate);
            $scope.newCandidateName = "";
            $scope.newCandidatePictureUrl = "";
        }, function (error) {
            console.log(error);
        });
    };
    
    $scope.removeCandidate = function (idx) {
        var candidate = $scope.candidates[idx];
        candidatesCRUD.removeCandidate(candidate).then(function () { 
            $scope.candidates.splice(idx, 1);
        }, function (error) { 
            console.log(error);
        });
    };
    
    init();
});