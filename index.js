/**
 * @file Index
 * @author Divya Mahajan / Nathaniel Taylor
 */
'use strict';

var monitoralert = {};
var moment = require('moment');

monitoralert.config=require('./bin/dbconfig.js');
monitoralert.util=require('./lib/util.js');
monitoralert.sendalert=require('./lib/sendalert.js');

monitoralert.initialize = function(dbconfig) {
        if (!(dbconfig===undefined)) {
            monitoralert.config = dbconfig;
        }

        process.on('SIGINT', onCtrlC);
        monitoralert.util.initialize(monitoralert.config);
        monitoralert.sendalert.initialize(monitoralert.config);
	setupListener();
    };

var counter = 0;
var observations = {};
function setupListener() {
  //var query = monitoralert.util.baseRef.orderByKey().limitToLast(10);
  var query = monitoralert.util.baseRef.orderByKey().startAt('2016-05-11').endAt('2016-05-12');
	// Use second one for testing on a particular date range
  query.on("child_added",addObservation);
  query.on("child_changed",addObservation);
  query.on("child_removed",removeObservation);
}

function removeObservation(dataSnapshot) {
	if (dataSnapshot.exists()) {
            delete observations[dataSnapshot.key()];
            console.info("remove", dataSnapshot.key());//,JSON.stringify(dataSnapshot.val()));
        }
}
function addObservation(data) {
	if (data.exists()) {
	    var key=data.key();
	    var val=data.val();
	    if (key[0]!='2') return;
	    observations[data.key()]=data.val();
	    // Get the record
	    // Logic here on the counter
	    console.info("add",data.key(),val.ServiceContract_missed,val.ServiceContract_latency); //JSON.stringify(data.val()));
		// Inject counter logic here
        }
}

function onCtrlC() {
    console.info("\nGracefully shutting down from SIGINT (Ctrl+C)");
    setTimeout(process.exit, 2000); // Wait 2 seconds and exit. This is needed for Firebase to exit.
}


monitoralert.initialize(monitoralert.config);
