'use strict';

var Alexa = require('alexa-sdk');
var should = require('should');
var GoogleMapsAPI = require('googlemaps');

var APP_ID = 'PUT APP ID HERE'; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var SKILL_NAME = 'City Driving';

var publicConfig = {
    key: 'AIzaSyA3SKRW7A2q4U8xYfbkVlAKZ9zD1zltTGw',
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
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['speechOutput'] = 'Welcome to ' + SKILL_NAME + '. You can ask a question like, what is the ' +
            'distance from San Francisco to New York City? Please tell me two cities you would like to find a driving distance between.';

        this.attributes['repromptSpeech'] = 'To find a driving distance, say something like: what is the distance from City 1 to City 2?';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'GetDistance': function() {
        var distSlot1 = this.event.request.intent.slots.Start.value; 
        var distSlot2 = this.event.request.intent.slots.Finish.value; 
        
        if(distSlot1!=null && distSlot1!=undefined && distSlot2!=undefined && distSlot2!=null){

            console.log(distSlot1+"-->"+distSlot2); 

            var self = this;
            var params = {
            origins: distSlot1,
            destinations: distSlot2,
            units: 'imperial'
            };
            gmAPI.distance(params, function(err, result){
            console.log("err: "+err);
            console.log("result: "+result);
            console.log("is result ok: "+result.status);
                
            var arry = result.rows[0].elements;
                
            if(arry[0].distance==undefined || arry[0].duration==undefined){
                self.emit('Unhandled'); 
            }
            else{
                console.log("distance is: "+arry[0].distance.text);  
                console.log("time is: "+arry[0].duration.text);   
                var totalResult = "The distance from " + params.origins + " to " + params.destinations + " is " + arry[0].distance.text + " and will take approximately " + arry[0].duration.text;

                self.emit(':tell',totalResult);
            }

          });
        }
        else{
          this.emit('Unhandled');    
        }
    },
    'AMAZON.HelpIntent': function() {
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes['repromptSpeech'] = 'You can ask a question like, what is the ' +
            'distance from Seattle to Portland? Please tell me two cities you would like to find a driving distance between.';
        this.emit(':ask', this.attributes['speechOutput'], this.attributes['repromptSpeech'])
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', 'Goodbye!');
    },
    'Unhandled': function() {
        this.emit(':tell', 'Sorry, I was unable to understand and process your request. Please try again.');
        this.emit('SessionEndedRequest');
    }
};