var AWS = require('aws-sdk');
exports.handler = (event, context, callback) => {
    AWS.config.region = 'us-east-1';
    var lexruntime = new AWS.LexRuntime();

    var params = {
        botAlias: "DiningConcierge",
        botName: "DiningConcierge",
        inputText: event["body-json"].message,
        userId: event["body-json"].uuid,
        sessionAttributes: {}
    };
    console.log(event);
    
    // validating input parameters for DiningSuggestionsIntent
    
    lexruntime.postText(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(err, "failed");
        } else {
            console.log(data); // got something back from Amazon Lex
            context.succeed(data);
        }
    });
};