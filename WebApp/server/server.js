"use strict";

(function server () {

    // Dependencies
    var express = require('express');
    var http = require('http');
    var bodyParser = require('body-parser');
    var service = require('./server/service');
            
    // Config
    var appPort = 7020;
    var appHost = "192.168.1.14";
    var jobDelay=500;
    var eventCounter = 1;
    var app = express().use(bodyParser.json());  
    var server = http.createServer(app);
    var ip = service.getIPAddress();
    
     // Init
    service.start(jobDelay);

    // Server start
    server.listen(appPort, appHost, function() {
            console.log("Server listening to %s:%d within %s environment",appHost, appPort, app.get('env'));
    });

    // Listening for incoming events
    app.post('/api/events', function(req, res, next) {
            // Avoid posting from external world
            if (req.connection.remoteAddress==ip && req.ip==ip) {
                var event = JSON.parse(JSON.stringify(req.body, null, 2));
                res.send("");
                service.processEvent(event); 
                eventCounter++;
            }
    })
    
    // Listening for GUI commands
    app.post('/api/commands', function(req, res, next) {
            res.send("");
            console.log('got command');
            var data = JSON.parse(JSON.stringify(req.body, null, 2));
            if (data.command == "reset") service.reset();
    })

    // Get the results
    app.get('/api/cars', function(req, res, next) {
            //console.log('got request');
            service.getResults(res, service.getStartTime());
    })

    // Serve the GUI
    app.get(/^(.+)$/, function(req, res) { res.sendfile('app/' + req.params[0]); });
    
    app.get('/', function(req, res){
            res.sendfile('./app/index.html'); 
    });

}());
