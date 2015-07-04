'use strict';

angular.module('lapTimerWeb')
    .controller('MainController', function ($scope, $http) {
        
        var getData = function() {
            $http.get('/api/cars').then(function (response) {
                $scope.cars = response.data;
                setTimeout(getData, 1000);
            });
        }
        
        getData();
        
    });

