# LapTimer
Lap timer scoring system for RC cars.
Using NRF24l01 radios (RF24 lib),  Arduino car modules 
and Raspberry Pi based main host. Web technology stack: 
Node.js, Bower, Express, Sqlite3, Angular.js, UIBootstrap

The idea is quite simple:
    - car with arduino module crosses finish line
    - hall or IR sensor in the car triggers message
    - message with car id and time is sent to the Raspberry
    - Raspberry receives the message stores it 
    - Web application shows table with lap times


1. CarModule - status:implemented
Arduino mini pro hardware, powered from BEC or lipo.
Module messages when finish line crossing is triggered by a sensor. 
Radio communication working. Triggering sensors work great (Vishay 38kHz IR sensor). 

2. Receiver - status:implemented
Simple C++ code to take care of the radio messages transmission and validation.
When a valid message is received then an event is created and car and time info
is posted to the REST service to collect line crossings and times.
Message validation is implemented. POST works reliably using cUrl.

3. WebApp - partially:implemented

    a) server - REST API for receiver and Web interface client. 
Listens for events posted by receiver and stores them in the database.
Get request at "/" returns index.html with an Angular app. 
Results and administration API to be done.

    b) gui - Web application to be a nice simple interface showing lap times.
Race and simple mode planned. Car names and race parameters configuration 
also to be implemmented.

4. Finish line transmitter
Transmitter not implemmented. Planned use of Arduino mini with 38kHz PWM signal and IR diode.
Currently a TV/AV equipment remote controller is used for test purposes and works good. 

