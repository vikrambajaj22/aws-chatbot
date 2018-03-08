exports.handler = (event, context, callback) => {
 console.log('Received event:', event);
 
 if (event.message === "") {
  callback(null, 'You didn\'t type anything!');
 }
 
 else if (event.message.toLowerCase()==="hello" || event.message.toLowerCase()==="hi" || event.message.toLowerCase()==="hey"){
  callback(null, 'Hello!');
 }
 
 else if (event.message.toLowerCase()=="how are you?"){
  callback(null, 'I\'m fine, how are you?');
 }
 
 else if (event.message.toLowerCase()=="bye"){
  callback(null, 'Good Bye!');
 }
 
 else {
  callback(null, 'I\'m not smart enough to respond to that yet!');
 }
};
