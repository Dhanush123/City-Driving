'use strict';

var Alexa = require('alexa-sdk');
var should = require('should');
var GoogleMapsAPI = require('googlemaps');

var APP_ID = 'PUT APP ID HERE'; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var SKILL_NAME = 'City Driving';

var publicConfig = {
    key: 'PUT GOOGLE MAPS SERVER KEY HERE',
    stagger_time:       100, // for elevationPath
    encode_polylines:   false,
    secure:             true, // use https
    //  proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
};

var gmAPI = new GoogleMapsAPI(publicConfig);


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'NewSession': function () {
        this.attributes['speechOutput'] = "Say something";
//            'Welcome to ' + SKILL_NAME + '. You can ask a question like, what is the ' +
//            'distance from San Francisco to New York City? Please tell me two cities you would like to find a driving distance between.';
        
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = 'To find a driving distance, say: what is the distance from City 1 to City 2?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'GetDistance': function() {
        var distSlot1 = this.event.request.intent.slots.Start.value;
        var origin = distSlot1.toString();
        var distSlot2 = this.event.request.intent.slots.Finish.value;
        var destination = distSlot2.toString();
        var self = this;
        var params = {
        origins: origin,
        destinations: destination,
        units: 'imperial'
        };
        gmAPI.distance(params, function(err, result){
        console.log("err: "+err);
        console.log("result: "+result);
        console.log("is result ok: "+result.status);
        var arry = result.rows[0].elements;
        console.log("distance is: "+arry[0].distance.text);  
        console.log("time is: "+arry[0].duration.text);   
        var totalResult = "The distance from " + params.origins + " to " + params.destinations + " is " + arry[0].distance.text + " and will take approximately " + arry[0].duration.text;

                self.emit(':tell',totalResult);
            
      });
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', 'Goodbye!');
    }
};




