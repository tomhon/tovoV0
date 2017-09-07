var restify = require('restify');
var builder = require('botbuilder');
var config = require("./config");

var documentClient = require("documentdb").DocumentClient;
var config = require("./config");
var url = require('url');

var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey });

var HttpStatusCodes = { NOTFOUND: 404 };
var databaseUrl = `dbs/${config.database.id}`;
var collectionUrl = `${databaseUrl}/colls/${config.collection.id}`;




// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

/**
 * Get the database by ID, or create if it doesn't exist.
 * @param {string} database - The database to get or create
 */
function getDatabase() {
    console.log(`Getting database:\n${config.database.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDatabase(databaseUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDatabase(config.database, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get the collection by ID, or create if it doesn't exist.
 */
function getCollection() {
    console.log(`Getting collection:\n${config.collection.id}\n`);

    return new Promise((resolve, reject) => {
        client.readCollection(collectionUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createCollection(databaseUrl, config.collection, { offerThroughput: 400 }, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * Get the document by ID, or create if it doesn't exist.
 * @param {function} callback - The callback function on completion
 */
function getDBDocument(document) {
    let documentUrl = `${collectionUrl}/docs/${document.id}`;
    console.log(`Getting document:\n${document.id}\n`);

    return new Promise((resolve, reject) => {
        client.readDocument(documentUrl, (err, result) => {
            if (err) {
                if (err.code == HttpStatusCodes.NOTFOUND) {
                    client.createDocument(collectionUrl, document, (err, created) => {
                        if (err) reject(err)
                        else resolve(created);
                    });
                } else {
                    reject(err);
                }
            } else {
                resolve(result);
            }
        });
    });
};

function pushLogData (document) {
    logDataArray.push(document);
    console.log('log pushed to array')
}

// List the questions to be asked
var InGameButtonList = Array ();
InGameButtonList[0] = 'Completed Pass';
InGameButtonList[1] = 'Attempted Pass';
InGameButtonList[2] = 'Successful Dribble';
InGameButtonList[3] = 'Attempted Dribble';
InGameButtonList[4] = 'Successful Trackle';
InGameButtonList[5] = 'Attempted Tackle';
InGameButtonList[6] = 'Shot';
InGameButtonList[7] = 'Goal';
InGameButtonList[8] = 'Scanning';
InGameButtonList[9] = 'In Space';
InGameButtonList[10] = 'Substituted Out';

function logData () {
// function logData (session, question, response) {
    // id is the timestamp
    var date = new Date();
    this.id = date.toISOString(),
    this.user = 'Admin',
    this.question = 'Bot Initialized',
    this.response = 'Successfully'
};

var logDataArray = Array();


//additional inputHints not supported in botbuilder 3.4.4 - TODO put these back in 
// var numberPromptOptions = { speak: InGameButtonList[0], inputHint: builder.InputHint.expectingInput,
//                 maxRetries: 3, minValue: 1, maxValue: 10, retryPrompt: 'Not a valid option'};

// var textPromptOptions = { speak: InGameButtonList[0], inputHint: builder.InputHint.expectingInput,
//                 maxRetries: 3, retryPrompt: 'Not a valid option'};

var numberPromptOptions = { 
                maxRetries: 3, minValue: 1, maxValue: 10, retryPrompt: 'Not a valid option'};

var textPromptOptions = { 
                maxRetries: 3, retryPrompt: 'Not a valid option'};

function logResponse (session, question, response) {
        oLogData = new logData();
        oLogData.user = session.message.user.name;
        oLogData.question = question.slice(0,question.indexOf('?')+1);
        oLogData.response = response;
        console.log('attempting write to docdb');
        getDBDocument(oLogData)
            .then(()  =>   console.log(oLogData))
            .catch((error) => { console.log(`Completed with error ${JSON.stringify(error)}`) });


}

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var savedAddress;

// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector)
var today = new Date().toLocaleDateString();

function startProactiveDialog(addr) {
  // set resume:false to resume at the root dialog
  // else true to resume the previous dialog
  bot.beginDialog(addr, "*:/survey", {}, { resume: true });  
}


bot.dialog('/', [ 
    function(session, args) {
        builder.Prompts.confirm(session, 'Would you like your name added to the Sports Science Survey list?');
        },

    function (session, results) {
        console.log('Response is ', results.response);
        if(results.response){
            savedAddress = session.message.address;
            console.log('Saved Address ', savedAddress);
            session.endDialog('Great - Thanks! I\'ve added you to the list and you\'ll receive your first survey in the next few days');
            }
        else 
            {
              session.endDialog('OK, bye!');
            }
    }
    ]);



bot.dialog('/survey', [
    function (session, args, next) {
        savedAddress = session.message.address;
        if (session.userData.lastSurveyDate === false) {
        //check for user already completed today's survey
        // if (session.userData.lastSurveyDate === today) {
            session.endDialog('You\'ve already given feedback on today\'s session. Thanks!');
        } 
    },
    function (session) {
        session.send('Hi '+ session.message.user.name + '! Please answer a few questions about training today.');
        logResponse(session, 'User Connected?', 'Successfully' );
        session.userData.lastSurveyDate = today;
        builder.Prompts.number( session, InGameButtonList[0], numberPromptOptions );
        },
    function (session, results) {
        logResponse(session, InGameButtonList[0], results.response);
        builder.Prompts.number( session, InGameButtonList[1], numberPromptOptions );
        // next();
    },
        function (session, results) {
        logResponse(session, InGameButtonList[1], results.response);
        builder.Prompts.number( session, InGameButtonList[2], numberPromptOptions );
        // next();
    },
        function (session, results) {
        logResponse(session, InGameButtonList[2], results.response);
        builder.Prompts.number( session, InGameButtonList[3], numberPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[3], results.response);
        builder.Prompts.number( session, InGameButtonList[4], numberPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[4], results.response);
        builder.Prompts.number( session, InGameButtonList[5], numberPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[5], results.response);
        builder.Prompts.number( session, InGameButtonList[6], numberPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[6], results.response);
        builder.Prompts.number( session, InGameButtonList[7], numberPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[7], results.response);
        builder.Prompts.number( session, InGameButtonList[8], numberPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[8], results.response);
        builder.Prompts.text( session, InGameButtonList[9], textPromptOptions );
        // next();
    },
        function (session, results, next) {
        logResponse(session, InGameButtonList[9], results.response);
        builder.Prompts.text( session, InGameButtonList[10], textPromptOptions );
        // next();
    },

    function (session, results) {
        session.send('Thanks for all your answers. See you soon!');
        logResponse(session, InGameButtonList[10], results.response);
        if (!results.response) {
            // exhausted attemps and no selection, start over
            session.send('Ooops! Too many attempts :( But don\'t worry, I\'m handling that exception and you can try again!');
            return session.endDialog();
        }



        // on error, start over

        session.on('error', function (err) {

            session.send('Failed with message: %s', err.message);

            session.endDialog();

        });



    }
]);

function sendProactiveMessage(addr) {
  var msg = new builder.Message().address(addr);
  msg.text('Hello, this is a notification');
  msg.textLocale('en-US');
  bot.send(msg);
}


// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html',
}));
server.get('/api/CustomWebApi', (req, res, next) => {
    startProactiveDialog(savedAddress);
    // sendProactiveMessage(savedAddress);
    res.send('triggered');
    next();
  }
);

initialLogEntry = new logData();


//initialize database
getDatabase()
     .then(() => getCollection())
     .then(() => {getDBDocument(initialLogEntry)})
     .catch((error) => { exit(`Completed with error ${JSON.stringify(error)}`) });
