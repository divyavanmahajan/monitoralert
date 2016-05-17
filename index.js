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
  var query = monitoralert.util.baseRef.orderByKey().limitToLast(10);
  // Use for testing a particular date range
  // var query = monitoralert.util.baseRef.orderByKey().startAt('2016-05-11T01:40:00').endAt('2016-05-11T03:15:00');
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
	    if (val.ServiceContract_missed >0) {console.info("add",data.key(),val.ServiceContract_missed,val.ServiceContract_latency); //JSON.stringify(data.val()));
		}
      //evaluate if an alert needs to be sent
      var errors = val.ServiceContract_missed;
      if (errors > 0){
            //console.log('yes there is an error');
            //and the counter is at 2
            if (counter == 2){
                //console.log('yes the counter is at 2');
                //send an alert
                monitoralert.sendalert.makecall();
                console.error("Phone call alert sent");
                //reset counter to zero
                counter = 0;
            }
            //otherwise add 1 to the counter
            else {
                //console.log('counter not at 2, increment the counter');
                counter = counter +1;
            }
        }
        //if there is not an error, reset the counter to zero
        else {
            //console.log('no error, reset the counter');
            counter = 0;
        }
      }  
}

function onCtrlC() {
    console.info("\nGracefully shutting down from SIGINT (Ctrl+C)");
    setTimeout(process.exit, 2000); // Wait 2 seconds and exit. This is needed for Firebase to exit.
}

monitoralert.initialize(monitoralert.config);
