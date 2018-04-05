// this lambda function polls messages from the SQS queue, send the details from the message to the Yelp API, receives a response from the Yelp API, and finally send an email to the customer with the Yelp response
'use strict';
exports.handler = (event, context, callback) => {
    console.log('LogScheduledEvent');
    console.log('Received event:', JSON.stringify(event, null, 2));
    // load the AWS SDK for Node.js
    var AWS = require('aws-sdk');
    // set the region 
    AWS.config.update({region: 'us-east-1'});
    
    // create an SQS service object
    var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
    
    var queueURL = "https://sqs.us-east-1.amazonaws.com/883279306403/customer_requests_queue";
    
    var params = {
        QueueUrl: queueURL,
        MessageAttributeNames: [
            "All"  // retrieves all the attributes i.e. location, cuisine...
            ]
    };
    
    var location = "";
    var cuisine = "";
    var dining_date = "";
    var dining_time = "";
    var number_of_people = "";
    var phone = "";
    var email = "";
    
    sqs.receiveMessage(params, function(err, data) {
      if (err) {
        console.log("Error receiving message from SQS", err);
       } 
       else {
           const message = data.Messages[0];
           console.log(message);
           const receipt_handle = data.Messages[0].ReceiptHandle;  // needed for deleting the message from the queue once processed
           
           location = message.MessageAttributes.location.StringValue;
           cuisine = message.MessageAttributes.cuisine.StringValue;
           dining_date = message.MessageAttributes.dining_date.StringValue;
           dining_time = message.MessageAttributes.dining_time.StringValue;
           number_of_people = message.MessageAttributes.number_of_people.StringValue;
           phone = message.MessageAttributes.phone.StringValue;
           email = message.MessageAttributes.email.StringValue;
           
           // converting phone number to format needed by SNS i.e. must begin with +1
           phone = phone.replace(/\D+/g, "");
           phone = phone.substr(phone.length-10);
           phone = "+1"+phone;
       }
    
    const yelp = require('yelp-fusion');
    const apiKey = 'JskDZEoyhqQHRUwxwGoUASPRnYKrHK32d39FLPuuj4SnR72k2hVGKG_GsT9ptZZsTN2wORympbjXzFD5624K38Ibx3z_L43A-Wl5krZHghlA1zbn_z3k2aTXvDbFWnYx';

    const searchRequest = {
        categories: cuisine,
        location: location,
        open_at: Math.round(new Date(dining_date + " " + dining_time).getTime()/1000) // unix time
    };
    
    const client = yelp.client(apiKey);
    
    client.search(searchRequest).then(response => {
        var firstResult = response.jsonBody.businesses[0];
        var secondResult = response.jsonBody.businesses[1];
        var thirdResult = response.jsonBody.businesses[2];
        //console.log(firstResult);
        var sms_string = "Hello! Here are my suggestions for " + cuisine + " restaurants in " + location + " for " + number_of_people + " people at " + dining_time + " on " + dining_date +":\n";
        if (firstResult){
            sms_string = sms_string + "1. First Suggestion: \n" + "Restaurant name: " + firstResult.name + "\nRestaurant Location: " + firstResult.location.address1 + "\nRating: " + firstResult.rating.toString() + "\nPhone: " + firstResult.phone +"\n\n";
        }
        if (secondResult){
            sms_string = sms_string + "2. Second Suggestion: \n" + "Restaurant name: " + secondResult.name + "\nRestaurant Location: " + secondResult.location.address1 + "\nRating: " + secondResult.rating.toString() + "\nPhone: " + secondResult.phone +"\n\n";
        }
        if (thirdResult){
            sms_string = sms_string + "3. Third Suggestion: \n" + "Restaurant name: " + thirdResult.name + "\nRestaurant Location: " + thirdResult.location.address1 + "\nRating: " + thirdResult.rating.toString() + "\nPhone: " + thirdResult.phone +"\n\n";
        }
        sms_string = sms_string + "Enjoy!";
        
        console.log(sms_string);
        
        let params = {
            Message: sms_string,
            PhoneNumber: phone
        };
        
        var sns = new AWS.SNS({apiVersion: '2010-03-31'});
        sns.publish(params, (err, result) => {
            if (err) {
                console.log(err);
               } else {
                   console.log('SMS Sent!');
                   console.log(result);
                   // delete message from SQS queue
                   var deleteParams = {
                       QueueUrl: queueURL,
                       ReceiptHandle: data.Messages[0].ReceiptHandle
                       };
                       sqs.deleteMessage(deleteParams, function(err, data) {
                           if (err) {
                               console.log("Delete Error", err);
                           } else {
                               console.log("Message Deleted from Queue", data);
                           }
                       });
               }
           })
    }).catch(e => {
        console.log(e);
});
});
};
