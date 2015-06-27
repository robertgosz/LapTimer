(function server () {

    // Dependencies
    var  express = require('express'),  
            http = require('http'),
            sqlite3 = require('sqlite3').verbose(),
            eventQueue =  require('queue').getQueue(),
            bodyParser = require('body-parser');
            
    // Config
    var  app_port = 7020,
            app_host = "127.0.0.1",
            job_delay=500,
            eventCounter = 1;
            
    // Init
    var startTime = new Date().getTime();
    var app = express();
    var db = new sqlite3.Database('server.db');
    var server = http.createServer(app);
    app.use(bodyParser.json());  

    // Event persisting background service
    backgroundService = function () {
            if (!eventQueue.isEmpty()) {
                    var item = eventQueue.dequeue();
                    backgroundJob(item);
            }        
    }

    // Single persist job
    backgroundJob = function (item) {
            try {
                db.run("INSERT INTO Laps (car, time) VALUES (?, ?)", [item.car, item.time]);
                console.log('Event stored. Car: %s. Time: %s \n', item.car, getTime(item.time));
            } catch (ex) {
                console.log(ex);
            }
    }
    
    // Returns formated local time from miliseconds timestamp (UTC)
    getTime = function(timestamp) {
            date = new Date(0);
            date.setUTCSeconds(timestamp/1000);
            date2 = new Date(timestamp*1);
            date2.setHours(date.getHours());
            var hours = date2.getHours();
            var minutes = "0" + date2.getMinutes();
            var seconds = "0" + date2.getSeconds();
            return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2)+':'+date2.getMilliseconds();
    }
    
    // Creates db structures
    createDb = function() {
            db.serialize(function() {
                    db.run("CREATE TABLE IF NOT EXISTS Cars (id INTEGER, name TEXT)");
                    db.run("CREATE TABLE IF NOT EXISTS Laps (id INTEGER PRIMARY KEY, car INTEGER, time INTEGER)");
                    db.run("CREATE TABLE IF NOT EXISTS Races (id INTEGER, start INTEGER, finish INTEGER, description TEXT)");
            });
    }
    
    // Check DB
    createDb();

    // Service start
    setInterval(backgroundService, job_delay);

    // Server start
    server.listen(app_port, app_host, function() {
            console.log("Server listening to %s:%d within %s environment",app_host, app_port, app.get('env'));
    });

    // Listening for incoming events
    app.post('/api/events', function(req, res, next) {
            // Avoid posting from external world
            if (req.connection.remoteAddress=='127.0.0.1' && req.ip=='127.0.0.1' ) {
                var event = JSON.parse(JSON.stringify(req.body, null, 2));
                eventQueue.enqueue(event); 
                res.send(getTime(event.time));
                eventCounter++;
            }
    })
    
    // Return current lap times or race results (if race is active)
    app.get('/api/results', function(req, res, next) {
            // Avoid posting from external world
            if (req.connection.remoteAddress=='127.0.0.1' && req.ip=='127.0.0.1' ) {
                
            }
    })

    // Serve the GUI
    app.get('*', function(req, res){
            res.sendfile('./public/index.html'); 
    });

}());
