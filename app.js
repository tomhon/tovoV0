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
    this.gameId = 'Not Configured'
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
        oLogData.gameId = session.userData.gameId;
        oLogData.player = player;
        oLogData.status = status;
        console.log('attempting write to docdb');
        getDBDocument(oLogData)
            .then(()  =>   console.log(oLogData))
            .catch((error) => { console.log(`Completed with error ${JSON.stringify(error)}`) });


}

function initializeTrackingData(session) {
    session.conversationData.completedPassCount = 0;
    session.conversationData.attemptedPassCount = 0;
    session.conversationData.successfulDribbleCount = 0;
    session.conversationData.attemptedDribbleCount = 0;
    session.conversationData.successfulTackleCount = 0;
    session.conversationData.attemptedTackleCount = 0;
    session.conversationData.shotCount = 0;
    session.conversationData.goalCount = 0;
    session.conversationData.inSpaceCount = 0;
    session.conversationData.scanningCount = 0;
    session.conversationData.substitutedInCount = 0;
    session.conversationData.susbstitutedOutCount = 0;
    session.conversationData.cornerCount = 0;
    session.conversationData.freeKickCount = 0;
    session.conversationData.penaltyKickCount = 0;
    session.conversationData.fouledCount = 0;
    session.conversationData.committedFoulCount = 0;
    session.conversationData.kickOffCount = 0;
    session.conversationData.finalWhistleCount = 0;
    session.conversationData.assistCount = 0;
    console.log('Tracking Data Initialized');
};

function initializeGameData(session) {
    var date = new Date();
    session.userData.gameId = date,
    console.log('Game Id set >>>>' + session.userData.gameId);
    session.userData.matchState = 'Pre-Game';
    console.log('Match State Changed >>>>' + session.userData.matchState);
    session.conversationData.playerTeamHomeAway = 'Home'; 
    session.conversationData.opponentTeam = null;
    session.conversationData.opponentClub = null;
    session.conversationData.gameLocation = null;
    session.conversationData.gameField = null;
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
        console.log('Match State >>>>' + session.userData.matchState);
        session.send("Welcome to the Player Tracker. I'm here to help gather stats on your player's performance");
        session.send("Enter details of your player and the game, then you're all set to hit 'Kick Off'");

//set up match state - validate states Pre-Game, 1st Half, Half Time, 2nd Half, Full Time
        if (session.userData.matchState==undefined) {
            session.userData.matchState = 'Pre-Game';
            console.log('Match State Changed >>>>' + session.userData.matchState);
        };
        if (session.userData.matchState == 'Pre-Game') {
//set up tracking data structure - using conversationData which persists across the conversation
            initializeTrackingData(session);
        };
        next();
    },
    function (session, results, next) {
        if (session.userData.playerName == undefined || session.userData.playerName == null ) 
            {session.beginDialog('askForPlayerName');} 
        else {next()}
    },
    function (session, results, next) {
        if (session.userData.playerNumber == undefined || session.userData.playerNumber == null ) 
            {session.beginDialog('askForPlayerNumber')} 
        else {next()}
    },
    function (session, results, next) {
        if (session.userData.matchState == '1st Half' || session.userData.matchState == '2nd Half')
                { session.beginDialog('inGameTracking') }
            else
                { session.beginDialog('playerAndGameDetails')}
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
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update player name/i });

// Dialog to ask for player number 
bot.dialog('askForPlayerNumber', [
    function (session) {
        builder.Prompts.number(session, "Please provide your player's number");
    },
    function (session, results) {
        session.userData.playerNumber = results.response;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update player number/i });


// Dialog to ask for player team 
bot.dialog('askForPlayerTeam', [
    function (session) {
        builder.Prompts.text(session, "Please provide your player's team name");
    },
    function (session, results) {
        session.userData.playerTeam = results.response;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update team/i });

// Dialog to ask for player team 
bot.dialog('askForPlayerClub', [
    function (session) {
        builder.Prompts.text(session, "Please provide your player's club name");
    },
    function (session, results) {
        session.userData.playerClub = results.response;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update club/i });

// Dialog to delete player data 
bot.dialog('deletePlayerData', [
    function (session) {
        session.userData.playerName = null;
        session.userData.playerNumber = null;
        session.userData.playerTeam = null;
        session.userData.playerClub = null;
        initializeTrackingData(session);
        session.send('Player Data Details Deleted');
        session.beginDialog('playerAndGameDetails').endDialog()
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
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update opponent team/i });

// Dialog to ask for opponent club 
bot.dialog('askForOpponentClub', [
    function (session) {
        builder.Prompts.text(session, "Please provide the opponent's club name");
    },
    function (session, results) {
        session.conversationData.opponentClub = results.response;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update opponent club/i });


// Dialog to ask for player team 
bot.dialog('askForGameLocation', [
    function (session) {
        builder.Prompts.text(session, "Please provide the game location");
    },
    function (session, results) {
        session.conversationData.gameLocation = results.response;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update game location/i });

// Dialog to ask for player team 
bot.dialog('askForGameField', [
    function (session) {
        builder.Prompts.text(session, "Please provide the field number");
    },
    function (session, results) {
        session.conversationData.gameField = results.response;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update game field/i });

// Dialog to delete player data 
bot.dialog('deleteGameData', [
    function (session) {
        initializeGameData(session)
        initializeTrackingData(session);
        session.send('Game Data Details Deleted');
        session.beginDialog('playerAndGameDetails').endDialog()
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
        .title(session.userData.matchState + " Player Details")
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
            .title(session.userData.matchState + " Game Details")
            .subtitle("Click to update information")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Kick Off", "Kick Off"),
                // builder.CardAction.imBack(session, "Final Whistle", "Final Whistle" ),
                builder.CardAction.imBack(session, "Update Home Team", session.userData.playerClub + ": " + session.conversationData.playerTeamHomeAway ),
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
                builder.CardAction.imBack(session, "Delete Game Data", "Track New Game" ),
                builder.CardAction.imBack(session, "Delete Player Data", "Track New Player" )
            ])

    ]);
    session.send(msg);
    session.endDialog(); //should never get called
});

// Dialog to display current stats and allow input of new stats 
bot.dialog('inGameTracking', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([
        new builder.HeroCard(session)
            .title(session.userData.matchState + " Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Completed Pass", "Completed Pass " + session.conversationData.completedPassCount),
                builder.CardAction.imBack(session, "Attempted Pass", "Attempted Pass " + session.conversationData.attemptedPassCount),
                builder.CardAction.imBack(session, "Successful Dribble", "Successful Dribble "+ session.conversationData.successfulDribbleCount),
                builder.CardAction.imBack(session, "Attempted Dribble", "Attempted Dribble "+ session.conversationData.attemptedDribbleCount),
                builder.CardAction.imBack(session, "Successful Tackle", "Successful Tackle "+ session.conversationData.successfulTackleCount),
                builder.CardAction.imBack(session, "Attempted Tackle", "Attempted Tackle "+ session.conversationData.attemptedTackleCount),

            ]),
            new builder.HeroCard(session)
            .title(session.userData.matchState + " Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Shot", "Shot "+ session.conversationData.shotCount),
                builder.CardAction.imBack(session, "Goal", "Goal "+ session.conversationData.goalCount),
                builder.CardAction.imBack(session, "Assist", "Assist "+ session.conversationData.assistCount),
                builder.CardAction.imBack(session, "Scanning", "Scanning "+ session.conversationData.scanningCount),
                builder.CardAction.imBack(session, "Substituted In", "Substituted In "+ session.conversationData.substitutedInCount),
                builder.CardAction.imBack(session, "Substituted Out", "Substituted Out "+ session.conversationData.susbstitutedOutCount)
            ]),
            new builder.HeroCard(session)
            .title(session.userData.matchState + " Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            // .text("Price is $25 and carried in sizes (S, M, L, and XL)")
            // .images([builder.CardImage.create(session, 'http://petersapparel.parseapp.com/img/whiteshirt.png')])
            .buttons([
                builder.CardAction.imBack(session, "Corner", "Corner "+ session.conversationData.cornerCount),
                builder.CardAction.imBack(session, "Free Kick", "Free Kick "+ session.conversationData.freeKickCount),
                builder.CardAction.imBack(session, "Penalty Kick", "Penalty Kick "+ session.conversationData.penaltyKickCount),
                builder.CardAction.imBack(session, "Fouled", "Fouled "+ session.conversationData.fouledCount),
                builder.CardAction.imBack(session, "Committed Foul", "Committed Foul "+ session.conversationData.committedFoulCount),
                builder.CardAction.imBack(session, "Final Whistle", "Final Whistle" )
            ])

    ]);
    session.send(msg).endDialog();
});

var today = new Date().toLocaleDateString();


// Dialog to ask for player team 
bot.dialog('askForHomeTeam', [
    function (session) {
        builder.Prompts.choice(session, "Is "+ session.userData.playerName+"'s team Home or Away?", "Home|Away");
    },
    function (session, results) {
        session.conversationData.playerTeamHomeAway = results.response.entity;
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /Update Home Team/i });
    
// Add dialog to handle button click
bot.dialog('assistButtonClick', [
    function (session) {
        session.conversationData.assistCount ++;
        logResponse (session, session.userData.playerNumber, 'Assist');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /assist/i });

// Add dialog to handle button click
bot.dialog('attemptedPassButtonClick', [
    function (session) {
        session.conversationData.attemptedPassCount ++;
        logResponse (session, session.userData.playerNumber, 'Attempted Pass');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /attempted pass/i });

// Add dialog to handle button click
bot.dialog('completedPassButtonClick', [
    function (session) {
        session.conversationData.completedPassCount ++;
        logResponse (session, session.userData.playerNumber, 'Completed Pass');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /completed pass/i });

// Add dialog to handle button click
bot.dialog('successfulDribbleButtonClick', [
    function (session) {
        session.conversationData.successfulDribbleCount ++;
        logResponse (session, session.userData.playerNumber, 'Successful Dribble');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /successful dribble/i });

// Add dialog to handle button click
bot.dialog('attemptedDribbleButtonClick', [
    function (session) {
        session.conversationData.attemptedDribbleCount ++;
        logResponse (session, session.userData.playerNumber, 'Attempted Dribble');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /attempted dribble/i });

// Add dialog to handle button click
bot.dialog('attemptedTackleButtonClick', [
    function (session) {
        session.conversationData.attemptedTackleCount ++;
        logResponse (session, session.userData.playerNumber, 'Attempted Tackle');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /attempted tackle/i });

// Add dialog to handle button click
bot.dialog('successfulTackleButtonClick', [
    function (session) {
        session.conversationData.successfulTackleCount ++;
        logResponse (session, session.userData.playerNumber, 'Successful Tackle');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /successful tackle/i });

// Add dialog to handle button click
bot.dialog('shotButtonClick', [
    function (session) {
        session.conversationData.shotCount ++;
        logResponse (session, session.userData.playerNumber, 'Shot');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /shot/i });

// Add dialog to handle button click
bot.dialog('goalButtonClick', [
    function (session) {
        session.conversationData.goalCount ++;
        logResponse (session, session.userData.playerNumber, 'Goal');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /goal/i });

// Add dialog to handle button click
bot.dialog('inSpaceButtonClick', [
    function (session) {
        session.conversationData.inSpaceCount ++;
        logResponse (session, session.userData.playerNumber, 'In Space');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /in space/i });

// Add dialog to handle button click
bot.dialog('scanningButtonClick', [
    function (session) {
        session.conversationData.scanningCount ++;
        logResponse (session, session.userData.playerNumber, 'Scanning');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /scanning/i });

// Add dialog to handle button click
bot.dialog('substitutedInButtonClick', [
    function (session) {
        session.conversationData.substitutedInCount ++;
        logResponse (session, session.userData.playerNumber, 'Substituted In');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /substituted in/i });

// Add dialog to handle button click
bot.dialog('substitutedOutButtonClick', [
    function (session) {
        session.conversationData.susbstitutedOutCount ++;
        logResponse (session, session.userData.playerNumber, 'Substituted Out');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /substituted out/i });

// Add dialog to handle button click
bot.dialog('cornerButtonClick', [
    function (session) {
        session.conversationData.cornerCount ++;
        logResponse (session, session.userData.playerNumber, 'Corner');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /corner/i });

// Add dialog to handle button click
bot.dialog('freeKickButtonClick', [
    function (session) {
        session.conversationData.freeKickCount ++;
        logResponse (session, session.userData.playerNumber, 'Free Kick');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /free kick/i });

// Add dialog to handle button click
bot.dialog('penaltyKickButtonClick', [
    function (session) {
        session.conversationData.penaltyKickCount ++;
        logResponse (session, session.userData.playerNumber, 'Penalty');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /penalty kick/i });

// Add dialog to handle button click
bot.dialog('fouledButtonClick', [
    function (session) {
        session.conversationData.fouledCount ++;
        logResponse (session, session.userData.playerNumber, 'Fouled');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /fouled/i });

// Add dialog to handle button click
bot.dialog('committedFoulButtonClick', [
    function (session) {
        session.conversationData.committedFoulCount ++;
        logResponse (session, session.userData.playerNumber, 'Committed Foul');
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /committed foul/i });

// Add dialog to handle button click
bot.dialog('kickOffButtonClick', [
    function (session,args,next) {
        session.conversationData.kickOffCount ++;
        if (session.userData.playerNumber == null || session.userData.playerNumber == undefined)
            {session.beginDialog('askForPlayerNumber')}
        else {next()}
    },
    function (session,args,next) {
        if (session.userData.matchState == 'Pre-Game') 
            {
                logResponse (session, session.userData.playerNumber, 'Kick Off 1st Half');
                session.userData.matchState = '1st Half';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                // session.beginDialog('inGameTracking');
            }
        if (session.userData.matchState == 'Half Time') 
            {
                logResponse (session, session.userData.playerNumber, 'Kick Off 2nd Half');
                session.userData.matchState = '2nd Half';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                // session.beginDialog('inGameTracking');
            }
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /kick off/i });

// Add dialog to handle button click
bot.dialog('finalWhistleButtonClick', [
    function (session) {
        session.conversationData.finalWhistleCount ++;
        if (session.userData.matchState == '1st Half') 
            {
                logResponse (session, session.userData.playerNumber, 'Final Whistle 1st Half');
                session.userData.matchState = 'Half Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                session.beginDialog('playerAndGameDetails');
            }
            if (session.userData.matchState == '2nd Half') 
                {
                    logResponse (session, session.userData.playerNumber, 'Final Whistle 2nd Half');
                    session.userData.matchState = 'Full Time';
                    console.log('Match State Changed >>>>' + session.userData.matchState);
                    session.beginDialog('playerAndGameDetails');
                }
        session.endDialog();

    }
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
