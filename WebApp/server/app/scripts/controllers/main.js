    'use strict';

    angular.module('lapTimerWeb')
    .controller('MainController', function ($scope, $http) {
        
        $scope.admin = true;
        
        $scope.resetApp = function () {
            $http.post('/api/commands', '{"command":"reset"}');
        }
        
        var getData = function(callback) {
            $http.get('/api/cars').
                success(function(data, status, headers, config) {
                for (var x=0; x<data.length; x++) {
                    data[x].fastest = callback(data[x].fastest);
                    data[x].avg = callback(data[x].avg);
                    data[x].last = callback(data[x].last);
                }
                 $scope.cars =  data;
                 setTimeout(function() { getData(callback) }, 1500);
            }).
            error(function(data, status, headers, config) {
                    setTimeout(function() { getData(callback) }, 3000);
            });                                                                                                           
        }

        var formatInterval = function (interval) {
             var temp = interval / 1000;
             var hours = '0' + Math.floor(temp/3600);
             temp = temp - (hours*3600);
             var minutes = '0' + Math.floor(temp/60);
             temp = temp - (minutes*60);
             var seconds = '0' + Math.floor(temp);
             var milis = interval - (hours * 3600 * 1000) - (minutes * 60 * 1000) - (seconds * 1000);
             return minutes.substr(-2)+":"+seconds.substr(-2)+":"+(milis+"00").substr(1,2);
        }

        getData(formatInterval);
        
    });

