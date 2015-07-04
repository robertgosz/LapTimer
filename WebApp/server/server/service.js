
    var startTime = new Date().getTime(),
          dao = require('./dao'),
          queue = require('./queue').getQueue();

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

    module.exports = {
        
            start:  function (job_delay) {
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
            
            formatTime: getTime
        
    };


    

    
    
    



