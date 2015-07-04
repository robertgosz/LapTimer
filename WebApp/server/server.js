"use strict";

(function server () {

    // Dependencies
    var express = require('express');
    var http = require('http');
    var bodyParser = require('body-parser');
    var service = require('./server/service');
            
    // Config
    var appPort = 7020;
    var appHost = "127.0.0.1";
    var jobDelay=500;
    var eventCounter = 1;
    var app = express().use(bodyParser.json());  
    var server = http.createServer(app);
    
     // Init
    service.start(jobDelay);

    // Server start
    server.listen(appPort, appHost, function() {
            console.log("Server listening to %s:%d within %s environment",appHost, appPort, app.get('env'));
    });

    // Listening for incoming events
    app.post('/api/events', function(req, res, next) {
            // Avoid posting from external world
            if (req.connection.remoteAddress=='127.0.0.1' && req.ip=='127.0.0.1' ) {
                var event = JSON.parse(JSON.stringify(req.body, null, 2));
                service.processEvent(event); 
                res.send(service.formatTime(event.time));
                eventCounter++;
            }
    })

    // Get the results
    app.get('/api/cars', function(req, res, next) {
            // Avoid get from external world
            if (req.connection.remoteAddress=='127.0.0.1' && req.ip=='127.0.0.1' ) {
                service.getResults(res, service.getStartTime());
            }
    })

    // Serve the GUI
    app.get('*', function(req, res){
            res.sendfile('./app/index.html'); 
    });

}());
