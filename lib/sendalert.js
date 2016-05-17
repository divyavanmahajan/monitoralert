/**
 * @file send alert
 * @sends an SMS with alert information via Twilio
 * @author Nathaniel Taylor
 */

// Twilio Credentials 

const util = require('./util.js');
var twilio = require('twilio');
var sendalert={};

var client;

sendalert.initialize=function(config) {
        sendalert.instance = config.instance || "dev";
        sendalert.accountSid = config.twilio_accountSid;
        sendalert.authToken = config.twilio_authToken;
        sendalert.phonenumber = config.twilio_phonenumber;
        sendalert.fromphonenumber = config.twilio_fromphonenumber;
}
//require the Twilio module and create a REST client
// Send alert to every phone number in the dbconfig.twilio_phonenumber list
sendalert.alert=function(messagebody) {
        var     client = twilio(sendalert.accountSid, sendalert.authToken);
        for (var idx in sendalert.phonenumber) {
        client.messages.create({
            'to': sendalert.phonenumber[idx],
            'from': sendalert.fromphonenumber,
            'body': sendalert.instance + ":" + messagebody
        }, function (err, errmsg) {
                if (err!=null) {
                util.winston.error('sendalert.alert:'+ JSON.stringify(err) +":" +JSON.stringify(errmsg));
                }
        });
        }
};


sendalert.makecall=function(){
	var client = twilio(sendalert.accountSid, sendalert.authToken);
    for (var idx in sendalert.phonenumber) {
    client.makeCall({
    'to': sendalert.phonenumber[idx],
    'from': sendalert.fromphonenumber,
    url: 'http://divyavanmahajan.github.io/monitoralert/alertmessage.xml', // A URL that produces an XML document (TwiML) which contains instructions for the call
    method: 'get'

}, function(err, responseData) {
    //executed when the call has been initiated.
    console.log(responseData.from);
});
}
}

module.exports = sendalert;


