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



function logData () {
// function logData (session, player, status) {
    // id is the timestamp
    var date = new Date();
    this.id = date.toISOString(),
    this.user = 'Admin',
    this.player = 'Bot Initialized',
    this.status = 'Successfully'
};

var logDataArray = Array();

var numberPromptOptions = { 
                maxRetries: 3, minValue: 1, maxValue: 10, retryPrompt: 'Not a valid option'};

var textPromptOptions = { 
                maxRetries: 3, retryPrompt: 'Not a valid option'};

function logResponse (session, player, status) {
        oLogData = new logData();
        oLogData.user = session.message.user.name;
        oLogData.player = player;
        oLogData.status = status;
        console.log('attempting write to docdb');
        getDBDocument(oLogData)
            .then(()  =>   console.log(oLogData))
            .catch((error) => { console.log(`Completed with error ${JSON.stringify(error)}`) });


}

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || "644048c6-8d61-4d63-8810-3832d34862e1",
    appPassword: process.env.MICROSOFT_APP_PASSWORD || "VQykmSeONQUD5JNeEccejWU"
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

var savedAddress;


// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, [
    function (session, args, next) {
        session.send("Welcome to the Player Tracker. ");
        if (session.userData.playerName == undefined) {session.beginDialog('askForPlayerName');} else {next()}
    },
    function (session, results, next) {
        if (session.userData.playerNumber == undefined) {session.beginDialog('askForPlayerNumber')} else {next()}
    },
    function (session, results, next) {
        session.beginDialog('playerAndGameDetails');
        session.beginDialog('inGameTracking');
        session.endDialog();
    }
]);


// Dialog to ask for player name 
bot.dialog('askForPlayerName', [
    function (session) {
        builder.Prompts.text(session, "Please provide your player's name");
    },
    function (session, results) {
        session.userData.playerName = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update player name/i });

// Dialog to ask for player number 
bot.dialog('askForPlayerNumber', [
    function (session) {
        builder.Prompts.number(session, "Please provide your player's number");
    },
    function (session, results) {
        session.userData.playerNumber = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update player number/i });


// Dialog to ask for player team 
bot.dialog('askForPlayerTeam', [
    function (session) {
        builder.Prompts.text(session, "Please provide your player's team name");
    },
    function (session, results) {
        session.userData.playerTeam = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update team/i });

// Dialog to ask for player team 
bot.dialog('askForPlayerClub', [
    function (session) {
        builder.Prompts.text(session, "Please provide your player's club name");
    },
    function (session, results) {
        session.userData.playerClub = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update club/i });

// Dialog to delete player data 
bot.dialog('deletePlayerData', [
    function (session) {
        session.userData.playerName = null;
        session.userData.playerNumber = null;
        session.userData.playerTeam = null;
        session.userData.playerClub = null;
        session.send('Player Data Details Deleted');
        session.endDialog()
    }
]).triggerAction({ matches: /Delete Player Data/i });


//dialog to display player details
bot.dialog('playerDetails', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
            new builder.HeroCard(session)
            .title("Player Details")
            .subtitle("Click to update information")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Update Player Name", "Name: " + session.userData.playerName ),
                builder.CardAction.imBack(session, "Update Player Number", "Number: " + session.userData.playerNumber ),
                builder.CardAction.imBack(session, "Update Team", "Team: " + session.userData.playerTeam ),
                builder.CardAction.imBack(session, "Update Club", "Club: " + session.userData.playerClub ),
                builder.CardAction.imBack(session, "Delete Player Data", "Delete Player Data" ),
            ])

    ]);
    session.send(msg).endDialog();
});


// Dialog to ask for opponent team 
bot.dialog('askForOpponentTeam', [
    function (session) {
        builder.Prompts.text(session, "Please provide the opponent's team name");
    },
    function (session, results) {
        session.conversationData.opponentTeam = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update opponent team/i });

// Dialog to ask for opponent club 
bot.dialog('askForOpponentClub', [
    function (session) {
        builder.Prompts.text(session, "Please provide the opponent's club name");
    },
    function (session, results) {
        session.conversationData.opponentClub = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update opponent club/i });


// Dialog to ask for player team 
bot.dialog('askForGameLocation', [
    function (session) {
        builder.Prompts.text(session, "Please provide the game location");
    },
    function (session, results) {
        session.conversationData.gameLocation = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update game location/i });

// Dialog to ask for player team 
bot.dialog('askForGameField', [
    function (session) {
        builder.Prompts.text(session, "Please provide the field number");
    },
    function (session, results) {
        session.conversationData.gameField = results.response;
        session.endDialogWithResult(results);
    }
]).triggerAction({ matches: /update game field/i });

// Dialog to delete player data 
bot.dialog('deleteGameData', [
    function (session) {
        session.conversationData.opponentTeam = null;
        session.conversationData.opponentClub = null;
        session.conversationData.gameLocation = null;
        session.conversationData.gameField = null;
        session.send('Game Data Details Deleted');
        session.endDialog()
    }
]).triggerAction({ matches: /Delete Game Data/i });


//dialog to display game details
bot.dialog('gameDetails', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
            new builder.HeroCard(session)
            .title("Game Details")
            .subtitle("Click to update information")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Update Opponent Team", "Opponent Team: " + session.conversationData.opponentTeam ),
                builder.CardAction.imBack(session, "Update Opponent Club", "Opponent Club: " + session.conversationData.opponentClub ),
                builder.CardAction.imBack(session, "Update Game Location", "Game Location: " + session.conversationData.gameLocation ),
                builder.CardAction.imBack(session, "Update Game Field", "Field Number: " + session.conversationData.gameField ),
                builder.CardAction.imBack(session, "Delete Game Data", "Delete Game Data" ),
            ])

    ]);
    session.send(msg).endDialog();
});

//dialog to display player and game details
bot.dialog('playerAndGameDetails', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([

        new builder.HeroCard(session)
        .title("Player Details")
        .subtitle("Click to update information")
        // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
        // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
        .buttons([
            builder.CardAction.imBack(session, "Update Player Name", "Name: " + session.userData.playerName ),
            builder.CardAction.imBack(session, "Update Player Number", "Number: " + session.userData.playerNumber ),
            builder.CardAction.imBack(session, "Update Team", "Team: " + session.userData.playerTeam ),
            builder.CardAction.imBack(session, "Update Club", "Club: " + session.userData.playerClub )
        ]),
        new builder.HeroCard(session)
            .title("Game Details")
            .subtitle("Click to update information")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Kick Off", "Kick Off"),
                builder.CardAction.imBack(session, "Final Whistle", "Final Whistle" ),
                builder.CardAction.imBack(session, "Update Opponent Team", "Opponent Team: " + session.conversationData.opponentTeam ),
                builder.CardAction.imBack(session, "Update Opponent Club", "Opponent Club: " + session.conversationData.opponentClub ),
                builder.CardAction.imBack(session, "Update Game Location", "Game Location: " + session.conversationData.gameLocation ),
                builder.CardAction.imBack(session, "Update Game Field", "Field Number: " + session.conversationData.gameField )
            ]),
            new builder.HeroCard(session)
            .title("Maintenance")
            .subtitle("Click to update information")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Delete Game Data", "Delete Game Data" ),
                builder.CardAction.imBack(session, "Delete Player Data", "Delete Player Data" )
            ])

    ]);
    session.send(msg).endDialog();
});

// Dialog to ask for player name 
bot.dialog('inGameTracking', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title("Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Completed Pass", "Completed Pass"),
                builder.CardAction.imBack(session, "Attempted Pass", "Attempted Pass"),
                builder.CardAction.imBack(session, "Successful Dribble", "Successful Dribble"),
                builder.CardAction.imBack(session, "Attempted Dribble", "Attempted Dribble"),
                builder.CardAction.imBack(session, "Successful Tackle", "Successful Tackle"),
                builder.CardAction.imBack(session, "Attempted Tackle", "Attempted Tackle"),

            ]),
            new builder.HeroCard(session)
            .title("Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Shot", "Shot"),
                builder.CardAction.imBack(session, "Goal", "Goal"),
                builder.CardAction.imBack(session, "In Space", "In Space"),
                builder.CardAction.imBack(session, "Scanning", "Scanning"),
                builder.CardAction.imBack(session, "Substituted In", "Substituted In"),
                builder.CardAction.imBack(session, "Substituted Out", "Substituted Out")
            ]),
            new builder.HeroCard(session)
            .title("Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Corner", "Corner"),
                builder.CardAction.imBack(session, "Free Kick", "Free Kick"),
                builder.CardAction.imBack(session, "Penalty Kick", "Penalty Kick"),
                builder.CardAction.imBack(session, "Fouled", "Fouled"),
                builder.CardAction.imBack(session, "Committed Foul", "Committed Foul")
            ])

    ]);
    session.send(msg).endDialog();
});

var today = new Date().toLocaleDateString();


// Add dialog to handle button click
bot.dialog('attemptedPassButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Attempted Pass');
        session.send("attempted pass Logged").endDialog();
    }
]).triggerAction({ matches: /attempted pass/i });

// Add dialog to handle button click
bot.dialog('completedPassButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Completed Pass');
        session.send("completed pass Logged").endDialog();
    }
]).triggerAction({ matches: /completed pass/i });

// Add dialog to handle button click
bot.dialog('successfulDribbleButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Successful Dribble');
        session.send("successful dribble Logged").endDialog();
    }
]).triggerAction({ matches: /successful dribble/i });

// Add dialog to handle button click
bot.dialog('attemptedDribbleButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Attempted Dribble');
        session.send("Attempted dribble Logged").endDialog();
    }
]).triggerAction({ matches: /attempted dribble/i });

// Add dialog to handle button click
bot.dialog('attemptedTackleButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Attempted Tackle');
        session.send("attempted tackle Logged").endDialog();
    }
]).triggerAction({ matches: /attempted tackle/i });

// Add dialog to handle button click
bot.dialog('successfulTackleButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Successful Tackle');
        session.send("successful tackle Logged").endDialog();}
]).triggerAction({ matches: /successful tackle/i });

// Add dialog to handle button click
bot.dialog('shotButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Shot');
        session.send("Shot Logged").endDialog();
    }
]).triggerAction({ matches: /shot/i });

// Add dialog to handle button click
bot.dialog('goalButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Goal');
        session.send("Goal Logged").endDialog();
    }
]).triggerAction({ matches: /goal/i });

// Add dialog to handle button click
bot.dialog('inSpaceButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'In Space');
        session.send("successful dribble Logged").endDialog();
    }
]).triggerAction({ matches: /in space/i });

// Add dialog to handle button click
bot.dialog('scanningButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Scanning');
        session.send("Scanning Logged").endDialog();
    }
]).triggerAction({ matches: /scanning/i });

// Add dialog to handle button click
bot.dialog('substitutedInButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Substituted In');
        session.send("Substituted In Logged").endDialog();
    }
]).triggerAction({ matches: /substituted in/i });

// Add dialog to handle button click
bot.dialog('substitutedOutButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Substituted Out');
        session.send("Substituted Out Logged").endDialog();}
]).triggerAction({ matches: /substituted out/i });

// Add dialog to handle button click
bot.dialog('cornerButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Corner');
        session.send("Corner Logged").endDialog();
    }
]).triggerAction({ matches: /corner/i });

// Add dialog to handle button click
bot.dialog('freeKickButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Free Kick');
        session.send("Free Kick Logged").endDialog();
    }
]).triggerAction({ matches: /free kick/i });

// Add dialog to handle button click
bot.dialog('penaltyKickButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Penalty');
        session.send("Penalty Logged").endDialog();
    }
]).triggerAction({ matches: /penalty kick/i });

// Add dialog to handle button click
bot.dialog('fouledButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Fouled');
        session.send("Fouled Logged").endDialog();
    }
]).triggerAction({ matches: /fouled/i });

// Add dialog to handle button click
bot.dialog('committedFoulButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Committed Foul');
        session.send("Committed Foul Logged").endDialog();
    }
]).triggerAction({ matches: /committed foul/i });

// Add dialog to handle button click
bot.dialog('kickOffButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Kick Off');
        session.send("Kick Off Logged").endDialog();}
]).triggerAction({ matches: /kick off/i });

// Add dialog to handle button click
bot.dialog('finalWhistleButtonClick', [
    function (session) {
        logResponse (session, session.userData.playerNumber, 'Final Whistle');
        session.send("Final Whistle Logged").endDialog();}
]).triggerAction({ matches: /final whistle/i });

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
