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
    
    // list of valid cities (supported by Yelp)
    const validLocations = ['phoenix', 'scottsdale', 'tempe', 'tucson', 'alameda', 'albany', 'alhambra', 'anaheim', 'belmont', 'berkeley', 'beverly hills', 'big sur', 'burbank', 'concord', 'costa mesa', 'culver city', 'cupertino', 'daly city', 'davis', 'dublin', 'emeryville', 'foster city', 'fremont', 'glendale', 'hayward', 'healdsburg', 'huntington beach', 'irvine', 'la jolla', 'livermore', 'long beach', 'los altos', 'los angeles', 'los gatos', 'marina del rey', 'menlo park', 'mill valley', 'millbrae', 'milpitas', 'monterey', 'mountain view', 'napa', 'newark', 'newport beach', 'oakland', 'orange county', 'palo alto', 'park la brea', 'pasadena', 'pleasanton', 'redondo beach', 'redwood city', 'sacramento', 'san bruno', 'san carlos', 'san diego', 'san francisco', 'san jose', 'san leandro', 'san mateo', 'san rafael', 'santa barbara', 'santa clara', 'santa cruz', 'santa monica', 'santa rosa', 'sausalito', 'sonoma', 'south lake tahoe', 'stockton', 'studio city', 'sunnyvale', 'torrance', 'union city', 'venice', 'walnut creek', 'west hollywood', 'west los angeles', 'westwood', 'yountville', 'boulder', 'denver', 'hartford', 'new haven', 'washington, dc', 'fort lauderdale', 'gainesville', 'miami', 'miami beach', 'orlando', 'tampa', 'atlanta', 'savannah', 'honolulu', 'lahaina', 'iowa city', 'boise', 'chicago', 'evanston', 'naperville', 'schaumburg', 'skokie', 'bloomington', 'indianapolis', 'louisville', 'new orleans', 'allston', 'boston', 'brighton', 'brookline', 'cambridge', 'somerville', 'baltimore', 'ann arbor', 'detroit', 'minneapolis', 'saint paul', 'kansas city', 'saint louis', 'charlotte', 'durham', 'raleigh', 'newark', 'princeton', 'albuquerque', 'santa fe', 'las vegas', 'reno', 'brooklyn', 'long island city', 'new york', 'flushing', 'cincinnati', 'cleveland', 'columbus', 'portland', 'salem', 'philadelphia', 'pittsburgh', 'providence', 'charleston', 'memphis', 'nashville', 'austin', 'dallas', 'houston', 'san antonio', 'salt lake city', 'alexandria', 'arlington', 'richmond', 'burlington', 'bellevue', 'redmond', 'seattle', 'madison', 'milwaukee'];
    
    console.log(event.currentIntent);
    
    if (location && !(location === "") && validLocations.indexOf(location.toLowerCase()) === -1) {
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `We do not support location: ${location}. Please provide a US city that is supproted by Yelp.`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "location"
          }
        }
        callback(null, response);
    }
    
    const validCuisines = ["mediterranean", "mexican", "italian", "indian", "chinese", "thai", "japanese", "greek", "turkish"];
    
    if (cuisine && !(cuisine === "") && validCuisines.indexOf(cuisine.toLowerCase()) === -1) {
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `Please choose from Mediterranean, Mexican, Italian, Indian, Chinese, Thai, Japanese, Greek, or Turkish.`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "cuisine"
          }
        }
        callback(null, response);
    }
    
    const date_regex = /^((((19|[2-9]\d)\d{2})\-(0[13578]|1[02])\-(0[1-9]|[12]\d|3[01]))|(((19|[2-9]\d)\d{2})\-(0[13456789]|1[012])\-(0[1-9]|[12]\d|30))|(((19|[2-9]\d)\d{2})\-02\-(0[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))\-02\-29))$/g;  //yyyy-mm-dd format, works for leap years (Feb), 30, 31 days etc. also works for tomorrow, today etc since lex returns values for these in same format
    if (dining_date && !(dining_date === "") && date_regex.test(dining_date)===false){
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `Please enter a valid date in YYYY-MM-DD format.`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "dining_date"
          }
        }
        callback(null, response);
    }
    
    const time_regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // time in 24 hour format because lex uses the same format; works with noon (lex returns 12:00), times like 4pm (lex would return 16:00) etc [however, we feel lex is automatically validating time and then sending it to lambda]
    if (dining_time && !(dining_time === "") && time_regex.test(dining_time)===false){
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `Please enter valid time in 24-hour format. Ex. 16:00`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "dining_time"
          }
        }
        callback(null, response);
    }
    
    if (number_of_people && !(number_of_people === "") && number_of_people<1){
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `At least 1 person is required to make a reservation. Please enter a value >=1.`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "number_of_people"
          }
        }
        callback(null, response);
    }
    
    const phone_regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (phone && !(phone === "") && phone_regex.test(phone)===false){
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `Please enter a valid phone number.`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "phone"
          }
        }
        callback(null, response);
    }
    
    const email_regex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (email && !(email === "") && email_regex.test(email)===false){
        let response = { sessionAttributes: event.sessionAttributes,
          dialogAction: {
            type: "ElicitSlot",
             message: {
               contentType: "PlainText",
               content: `Please enter a valid email address.`
            },
             intentName: event.currentIntent.name,
             slots: slots,
             slotToElicit : "email"
          }
        }
        callback(null, response);
    }
    
    let response = {sessionAttributes: sessionAttributes,
      dialogAction: {
        type: "Delegate",
        slots: event.currentIntent.slots
      }
    }
    callback(null, response);
};
