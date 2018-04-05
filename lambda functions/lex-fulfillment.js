// pushes Lex message to SQS queue once the DiningSuggestionsIntent is ready for fulfillment
'use strict';
exports.handler = (event, context, callback) => {
    const sessionAttributes = event.sessionAttributes;
    const slots = event.currentIntent.slots;
    
    const location = slots.location;
    const cuisine = slots.cuisine;
    const dining_date = slots.dining_date;
    const dining_time = slots.dining_time;
    const number_of_people = slots.number_of_people;
    const phone = slots.phone;
    const email = slots.email;
    
    console.log(event.currentIntent);
    
    // putting a message conatining slot values onto the SQS queue (note: SQS queue must be created before this is executed)
    // load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    // set the region 
    AWS.config.update({region: 'us-east-1'});
    
    // create an SQS service object
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    
    var params = {
     MessageAttributes: {
      "location": {
        DataType: "String",
        StringValue: location
       },
      "cuisine": {
        DataType: "String",
        StringValue: cuisine
       },
      "dining_date": {
        DataType: "String",
        StringValue: dining_date
       },
       "dining_time": {
        DataType: "String",
        StringValue: dining_time
       },
       "number_of_people": {
        DataType: "String",
        StringValue: number_of_people
       },
       "phone": {
        DataType: "String",
        StringValue: phone
       },
       "email": {
        DataType: "String",
        StringValue: email
       }
     },
     MessageBody: "Details received from the customer upon intent fulfillment.",
     QueueUrl: "https://sqs.us-east-1.amazonaws.com/883279306403/customer_requests_queue"
    };
    
    sqs.sendMessage(params, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.MessageId);
        console.log(data);
      }
    });
    
    // close informs the Lex intent not to expect any further responses from the user 
    let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
              type: "Close",
              fulfillmentState: "Fulfilled",
              message: {
                  contentType: "PlainText",
                  content: `Thank You! Your request is being processed and you will receive an SM soon!`
              }
          }
    };
    callback(null, response);
};
