# LapTimer
Lap timer scoring system for RC cars.
Using NRF24l01 radios (RF24 lib),  Arduino car modules and Raspberry Pi based main host.
The idea is quite simple:
- car with arduino module crosses finish line
- hall or IR sensor in the car triggers message
- message with car id and timestamp is sent to the Raspberry
- Raspberry receives the message and saves it into a database
- Web application shows score table with lap times


1. CarModule 

Sends messages when finish line crossing is triggered by a sensor.
Radio communication is working.
Triggering sensors are not implemented yet. 

2. Receiver

Simple C++ code to take care of the radio messages transmission and validation.
When a valid message is received then an event is created and car and time info
should be posted to the RESTful Web API to collect line crossings and times.
Message validation is implemented. HTTP POST to be done.

3. WebApp

a) server - REST API for receiver and Web interface client. 
Should listen for events posted by receiver, store them in database 
and offer a nice API for the GUI application.
NOT IMPLEMENTED 
Planned technology stack: Node.js, Express, Sqlite

b) gui - Web application to be a nice simple interface showing cars and 
their lap times and allowing configured race timing (race duration, 
driver names...)
NOT IMPLEMMENTED
Planned solution: Angular.js app using REST service as data source.
