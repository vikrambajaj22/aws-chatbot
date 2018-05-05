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
           console.log("Data:", data);
           if (data.hasOwnProperty("Messages")){
               const message = data.Messages[0];
               console.log(message);
               const receipt_handle = message.ReceiptHandle;  // needed for deleting the message from the queue once processed
               
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
               
               // query elasticsearch based on cuisine
               var elasticsearch=require('elasticsearch');
               cuisine = cuisine.toLowerCase();
               var business_id_list = [];
               console.log(cuisine);
               var client = new elasticsearch.Client({hosts: ['search-elastic-prediction-oyy35i6a32pgx32lxo34pkz4pa.us-east-1.es.amazonaws.com']});
               client.search({
                   index: cuisine,
                   body: {
                       "size": 5,
                       "query": { "match_all": {} },
                       "_source": "business_id",
                       "sort": { "score": { "order": "desc" } }  // sort in descending order of score to get top 5 recommended restaurants
                   }
               }).then(function(resp) {
                   console.log(resp);
                   resp.hits.hits.forEach(function(hit){
                       business_id_list.push(hit._source.business_id);
                       console.log(hit);
                       });
                       console.log(business_id_list);
                       // query dynamodb with business_ids
                        const AWS = require('aws-sdk');
                        const docClient = new AWS.DynamoDB.DocumentClient({region: "us-east-1"});
                        
                        var sms_string = "Hello! Here are my suggestions for " + cuisine + " restaurants in " + location + " for " + number_of_people + " people at " + dining_time + " on " + dining_date +":\n";
                        var count = 0;
                        for (var i=0; i<business_id_list.length; i++){
                            var id = business_id_list[i];
                            console.log(id);
                            var params = {
                               TableName: "yelp-restaurants-table",
                               KeyConditionExpression: "#id = :id and #cuisine = :cuisine",
                               ExpressionAttributeNames: {
                                   "#id": "id",
                                   "#cuisine": "cuisine"
                               },
                               ExpressionAttributeValues: {
                                   ":id": id,
                                   ":cuisine": cuisine.charAt(0).toUpperCase() + cuisine.slice(1)  // capitalize first letter of cuisine since cuisines begin with a capital letter in DynamoDB
                               }
                           };
                           docClient.query(params, function(err, data) {
                           if (err) {
                               console.log(err);
                               } else {
                                   console.log(data);
                                   // data.Items will be empty if a matching business_id was not found in DynamoDB
                                   console.log(data.Items.length);
                                   if (data.Items.length!=0){
                                       var restaurant_name = data.Items[0].name;
                                       var restaurant_address = data.Items[0].location_address1 + ", " + data.Items[0].location_city;
                                       var restaurant_price = data.Items[0].price;
                                       var restaurant_rating = data.Items[0].rating;
                                       
                                       count = count + 1;
                                       sms_string = sms_string + count.toString() + ". " + restaurant_name + ", " + restaurant_address + ".\nPrice: " + restaurant_price + "\nRating: " + restaurant_rating  + "\n\n";
                                   }
                                   }
                           });
                        }
                    setTimeout(function () {
                        sms_string = sms_string + "Enjoy!";
                        console.log(sms_string);
                        
                        // send SMS to user using SNS
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
                    }, 5000);
                   }, function(err) {
                       console.log(err.message);
                       });
                   }
               }
    });       
};