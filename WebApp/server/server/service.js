
    var startTime;
    var dao = require('./dao');
    var queue = require('./queue').getQueue();

    // Function called from timer to persist incoming events
    var backgroundService = function () {
            if (!queue.isEmpty()) {
                    var event = queue.dequeue();
                    dao.getLastTime(event, startTime, dao.saveLap);
            }        
    }
    
    // Returns formated local time from miliseconds timestamp (UTC)
    var getTime = function(timestamp) {
            var date = new Date(0);
            var date2 = new Date(timestamp*1);
            date.setUTCSeconds(timestamp/1000);
            date2.setHours(date.getHours());
            var hours = date2.getHours();
            var minutes = "0" + date2.getMinutes();
            var seconds = "0" + date2.getSeconds();
            return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)+':'+date2.getMilliseconds();
    }
    
    // Gets the local Ip address 
    var getIPAddress = function () {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
                }
            }
        return '0.0.0.0';
    }

    module.exports = {
        
        start:  function (job_delay) {
                startTime = new Date().getTime();
                dao.createDb();
                //dao.createConfig();
                setInterval(backgroundService, job_delay);
        },
        
        getStartTime: function () {
                return startTime;
        },
        
        processEvent: function (event) {
                queue.enqueue(event); 
        },
        
        getResults: function (res) {
                dao.getResults(res, startTime);
        },
        
        reset: function () {
                startTime = new Date().getTime();
        },
        
        formatTime: getTime,
        
        getIPAddress: getIPAddress
        
    };


    

    
    
    



