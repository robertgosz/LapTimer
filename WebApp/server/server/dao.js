
    var sqlite3 = require('sqlite3').verbose();
    var db = new sqlite3.Database('./server.db');

    // Creates db structures
    var createDb = function() {
            db.serialize(function() {
                db.run("CREATE TABLE IF NOT EXISTS cars (id INTEGER, name TEXT)");
                db.run("CREATE TABLE IF NOT EXISTS laps (lap_id INTEGER PRIMARY KEY AUTOINCREMENT, car_id INTEGER, time INTEGER, laptime INTEGER)");
                db.run("CREATE TABLE IF NOT EXISTS races (race_id INTEGER PRIMARY KEY AUTOINCREMENT,  start INTEGER, finish INTEGER, description TEXT)");
            });
    }
    
    // Inserts example car config
    var createConfig = function () {
            db.run("INSERT INTO Cars (id, name) VALUES (?, ?)", [1, "Robert"]);  
            db.run("INSERT INTO Cars (id, name) VALUES (?, ?)", [5, "Stefan"]);  
    }

    // Checks for laptime and calls async save to persist current lap
    var getLastTime = function (item, startTime, callback) {
            var query = "SELECT time, car_id FROM laps WHERE time < ? and car_id = ? and laps.time > ? ORDER BY time desc LIMIT 1";
            db.all(query, [item.time, item.car, startTime], function(err, rows) {
                    if (err) throw err;
                    if (rows.length == 0) {
                        callback(item, 0);
                    } else {
                        callback(item, item.time-rows[0].time);
                    }
            });
    }
    
    // Async lap save
    var saveLap = function (item, laptime) {
            var query = "INSERT INTO laps (car_id, time, laptime) VALUES (?, ?, ?)";
            db.run(query, [item.car, item.time, laptime], function() {
                    console.log("Event stored");
            });
    }
    
    // Buid results / statistics  query
    var buildResultsQuery = function (startTime)  {
            var query;
            query  =  "SELECT cars.id, cars.name, fastlap.fastest, avglap.avg, lastlap.last, count(laps.lap_id)-1 as lapcount FROM laps LEFT JOIN cars ON laps.car_id = cars.id ";
            query += "LEFT JOIN (SELECT laps.car_id, min(laps.laptime) as fastest FROM laps WHERE laps.time > "+startTime+" AND laps.laptime>0 GROUP BY laps.car_id) fastlap ON laps.car_id= fastlap.car_id ";
            query += "LEFT JOIN (SELECT laps.car_id, cast(avg(laps.laptime) as INTEGER) as avg FROM laps WHERE laps.time > "+startTime+" AND laps.laptime>0 GROUP BY laps.car_id) avglap ON laps.car_id = avglap.car_id ";
            query += "LEFT JOIN (SELECT car_id, laptime as last, max(lap_id)  FROM laps WHERE laps.time > "+startTime+" AND laps.laptime>0 GROUP BY car_id) lastlap ON laps.car_id = lastlap.car_id ";
            query += "WHERE laps.time > "+startTime+" ";
            query += "GROUP BY cars.id, cars.name ORDER BY lapcount desc, lastlap.last asc";
            return query;
    }
    
    // Retur cars statistics
    var getResults = function (res, startTime) {
            var query = buildResultsQuery(startTime);
            var currentTime = new Date().getTime(); // implement race time
            db.all(query, function(err, rows) {
                    if (err) throw err;
                    if (rows.length == 0) {
                        res.send("");
                    } else {
                        res.send(JSON.stringify(rows));
                    }
            });
    }
    
    module.exports = {
        
        createDb: createDb,
        createConfig: createConfig,
        getResults: getResults,
        getLastTime: getLastTime,
        saveLap: saveLap

    };
