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
function setupListener() {
  monitoralert.util.baseRef.on("child_added",function(dataSnapshot,prevKey) {
        if (dataSnapshot.exists()) {
	    // Get the record
	    // Logic here on the counter
	    console.info(dataSnapshot.key());//,JSON.stringify(dataSnapshot.val()));
        }
  });
}

function onCtrlC() {
    console.info("\nGracefully shutting down from SIGINT (Ctrl+C)");
    setTimeout(process.exit, 2000); // Wait 2 seconds and exit. This is needed for Firebase to exit.
}


monitoralert.initialize(monitoralert.config);
