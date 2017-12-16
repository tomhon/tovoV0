var restify = require('restify');
var builder = require('botbuilder');

var config = require("./config");
var processButtonClick = require("./processButtonClick");
var updateElapsedTime = require("./updateElapsedTime");

//stub this in when online
var logResponse = require("./logResponseSQL");
//stub this out when online
// function logResponse (session,player,status) {
//     console.log(status + 'not logged');
//     return;
// }
var initializePlayerTrackingData = require("./initializePlayerTrackingData");
var addNewVariablesToUserData = require("./addNewVariablesToUserData");
var matchInProgress = require("./matchInProgress");

var moment = require('moment');
moment().format('hh:mm:ss')



// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

function logData () {
// function logData (session, player, status) {
    // id is the timestamp
    var date = new Date();
    this.id = date.toISOString(),
    this.gameId = 'Not Configured',
    this.user = 'Admin',
    this.status = 'Bot Initialized'
};

var numberPromptOptions = { 
                maxRetries: 3, minValue: 1, maxValue: 10, retryPrompt: 'Not a valid option'};

var textPromptOptions = { 
                maxRetries: 3, retryPrompt: 'Not a valid option'};

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
        addNewVariablesToUserData(session);
        session.send("Welcome to the Player Tracker. I'm here to help gather stats on your player's performance");
//set up match state - validate states Pre-Game, 1st Half, Half Time, 2nd Half, Full Time
        if (session.userData.matchState==undefined) {
            initializePlayerTrackingData(session);
            session.userData.matchState = 'Pre-Game';
            session.userData.playerName = '<Enter>';
            session.userData.playerNumber = '<Enter>';
            session.userData.playerTeam = '<Enter>';
            session.userData.playerClub = '<Enter>';
            console.log('Match State Changed >>>>' + session.userData.matchState);
        };
        if (session.userData.matchState=='Full Time') {
            builder.Prompts.choice(session, "Would you like to track a new game?", "Yes | No", { listStyle: builder.ListStyle.button });
        };
        next();
    },
    function (session, results, next) {
        if (results.response != undefined) {
            if (results.response.entity === 'Yes ') {
                initializePlayerTrackingData(session);
                session.send('Game Data Details Initialized');
            };
        };
        next();
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
        logResponse (session, session.userData.playerNumber, 'Player Name Updated');
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
        logResponse (session, session.userData.playerNumber, 'Player Number Updated');
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
        logResponse (session, session.userData.playerNumber, 'Team Name Updated');
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update team/i });

// Dialog to ask for player club 
bot.dialog('askForPlayerClub', [
    function (session) {
            builder.Prompts.text(session, "Please provide your player's club name");
        },
        function (session, results) {
            session.userData.playerClub = results.response;
            logResponse (session, session.userData.playerNumber, 'Club Name Updated');
            session.beginDialog('playerAndGameDetails').endDialog();
        }
]).triggerAction({ matches: /update club/i });

// Dialog to delete player data 
bot.dialog('deletePlayerData', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Delete Player Data')).endDialog
    }
]).triggerAction({ matches: /Delete Player Data/i });


// Dialog to ask for opponent team 
bot.dialog('askForOpponentTeam', [
    function (session) {
        builder.Prompts.text(session, "Please provide the opponent's team name");
    },
    function (session, results) {
        session.userData.opponentTeam = results.response;
        logResponse (session, session.userData.playerNumber, 'Opponent Team Updated');
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update opponent team/i });

// Dialog to ask for opponent club 
bot.dialog('askForOpponentClub', [
    function (session) {
        builder.Prompts.text(session, "Please provide the opponent's club name");
    },
    function (session, results) {
        session.userData.opponentClub = results.response;
        logResponse (session, session.userData.playerNumber, 'Opponent Club Updated');
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update opponent club/i });


// Dialog to ask for player team 
bot.dialog('askForGameLocation', [
    function (session) {
        builder.Prompts.text(session, "Please provide the game location");
    },
    function (session, results) {
        session.userData.gameLocation = results.response;
        logResponse (session, session.userData.playerNumber, 'Game Location Updated');
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update game location/i });

// Dialog to ask for player team 
bot.dialog('askForGameField', [
    function (session) {
        builder.Prompts.text(session, "Please provide the field number");
    },
    function (session, results) {
        session.userData.gameField = results.response;
        logResponse (session, session.userData.playerNumber, 'Game Field Updated');
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /update game field/i });

// Dialog to delete player data 
bot.dialog('deleteGameData', [
    function (session) {
        // initializeGameData(session)
        session.beginDialog(processButtonClick(session, 'Delete Game Data')).endDialog();
    }
]).triggerAction({ matches: /Delete Game Data/i });


//dialog to display player and game details
bot.dialog('playerAndGameDetails', function (session) {
    var msg = new builder.Message(session);
    msg.attachmentLayout(builder.AttachmentLayout.carousel)
    msg.attachments([

        new builder.HeroCard(session)
        .title(session.userData.matchState + " Player Details")
        .subtitle("Click to update information")
        .buttons([
            builder.CardAction.imBack(session, "Update Player Name", "Name: " + session.userData.playerName ),
            builder.CardAction.imBack(session, "Update Player Number", "Number: " + session.userData.playerNumber ),
            builder.CardAction.imBack(session, "Update Team", "Team: " + session.userData.playerTeam ),
            builder.CardAction.imBack(session, "Update Club", "Club: " + session.userData.playerClub ),
            builder.CardAction.imBack(session, "Player Time", "Player Time: " + moment(session.userData.totalPlayerElapsedTime).format('mm:ss') ),
            builder.CardAction.imBack(session, "Game Time", "Game Time: " + moment(session.userData.totalGameElapsedTime).format('mm:ss') )

        ]),
        new builder.HeroCard(session)
            .title(session.userData.matchState + " Game Details")
            .subtitle("Click to update information")

            .buttons([
                builder.CardAction.imBack(session, "Kick Off", "Kick Off"),
                builder.CardAction.imBack(session, "Update Home Team", session.userData.playerClub + ": " + session.userData.playerTeamHomeAway ),
                builder.CardAction.imBack(session, "Update Opponent Team", "Opponent Team: " + session.userData.opponentTeam ),
                builder.CardAction.imBack(session, "Update Opponent Club", "Opponent Club: " + session.userData.opponentClub ),
                builder.CardAction.imBack(session, "Update Game Location", "Game Location: " + session.userData.gameLocation ),
                builder.CardAction.imBack(session, "Update Game Field", "Field Number: " + session.userData.gameField )
            ]),
            new builder.HeroCard(session)
            .title("Maintenance")
            .subtitle("Click to update information")
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
            .buttons([
                builder.CardAction.imBack(session, "Completed Pass", "Completed Pass " + session.userData.completedPassCount),
                builder.CardAction.imBack(session, "Attempted Pass", "Attempted Pass " + session.userData.attemptedPassCount),
                builder.CardAction.imBack(session, "Successful Dribble", "Successful Dribble "+ session.userData.successfulDribbleCount),
                builder.CardAction.imBack(session, "Attempted Dribble", "Attempted Dribble "+ session.userData.attemptedDribbleCount),
                builder.CardAction.imBack(session, "Successful Tackle", "Successful Tackle "+ session.userData.successfulTackleCount),
                builder.CardAction.imBack(session, "Attempted Tackle", "Attempted Tackle "+ session.userData.attemptedTackleCount),

            ]),
            new builder.HeroCard(session)
            .title(session.userData.matchState + " Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            .buttons([
                builder.CardAction.imBack(session, "Shot", "Shot "+ session.userData.shotCount),
                builder.CardAction.imBack(session, "Goal", "Goal "+ session.userData.goalCount),
                builder.CardAction.imBack(session, "Assist", "Assist "+ session.userData.assistCount),
                builder.CardAction.imBack(session, "Corner", "Corner "+ session.userData.cornerCount),
                builder.CardAction.imBack(session, "Free Kick", "Free Kick "+ session.userData.freeKickCount),
                builder.CardAction.imBack(session, "Penalty Kick", "Penalty Kick "+ session.userData.penaltyKickCount)
            ]),
            new builder.HeroCard(session)
            .title(session.userData.matchState + " Tracking Player #%s", session.userData.playerNumber )
            .subtitle("Click to log activity")
            .buttons([

                builder.CardAction.imBack(session, "Scanning", "Scanning "+ session.userData.scanningCount),
                builder.CardAction.imBack(session, "Substituted In", "Substituted In "+ session.userData.substitutedInCount),
                builder.CardAction.imBack(session, "Substituted Out", "Substituted Out "+ session.userData.substitutedOutCount),
                builder.CardAction.imBack(session, "Fouled", "Fouled "+ session.userData.fouledCount),
                builder.CardAction.imBack(session, "Committed Foul", "Committed Foul "+ session.userData.committedFoulCount),
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
        session.userData.playerTeamHomeAway = results.response.entity;
        logResponse (session, session.userData.playerNumber, 'Home Team Updated');
        session.beginDialog('playerAndGameDetails').endDialog();
    }
]).triggerAction({ matches: /Update Home Team/i });



    


// Add dialog to handle button click
bot.dialog('attemptedPassButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Attempted Pass')).endDialog();
    }
]).triggerAction({ matches: /attempted pass/i });

// Add dialog to handle button click
bot.dialog('completedPassButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Completed Pass')).endDialog();
    }
]).triggerAction({ matches: /completed pass/i });

// Add dialog to handle button click
bot.dialog('successfulDribbleButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Successful Dribble')).endDialog();
    }
]).triggerAction({ matches: /successful dribble/i });

// Add dialog to handle button click
bot.dialog('attemptedDribbleButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Attempted Dribble')).endDialog();
    }
]).triggerAction({ matches: /attempted dribble/i });

// Add dialog to handle button click
bot.dialog('attemptedTackleButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Attempted Tackle')).endDialog
    }
]).triggerAction({ matches: /attempted tackle/i });

// Add dialog to handle button click
bot.dialog('successfulTackleButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Successful Tackle')).endDialog
    }
]).triggerAction({ matches: /successful tackle/i });

// Add dialog to handle button click
bot.dialog('shotButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Shot')).endDialog
    }
]).triggerAction({ matches: /shot/i });

// Add dialog to handle button click
bot.dialog('shotOnFrameButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Shot on Frame')).endDialog
    }
]).triggerAction({ matches: /shotOnFrame/i });

// Add dialog to handle button click
bot.dialog('shotOffFrameButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Shot off Frame')).endDialog;
    }
]).triggerAction({ matches: /shotOffFrame/i });

// Add dialog to handle button click
bot.dialog('goalButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Goal')).endDialog;
    }
]).triggerAction({ matches: /goal/i });

// Add dialog to handle button click
bot.dialog('assistButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Assist')).endDialog;
    }
]).triggerAction({ matches: /assist/i });

// Add dialog to handle button click
bot.dialog('inSpaceButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'In Space')).endDialog;
    }
]).triggerAction({ matches: /in space/i });

// Add dialog to handle button click
bot.dialog('scanningButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Scanning')).endDialog;
    }
]).triggerAction({ matches: /scanning/i });

// Add dialog to handle button click
bot.dialog('substitutedInButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Substituted In')).endDialog;
    }
]).triggerAction({ matches: /substituted in/i });

// Add dialog to handle button click
bot.dialog('substitutedOutButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Substituted Out')).endDialog;
    }
]).triggerAction({ matches: /substituted out/i });

// Add dialog to handle button click
bot.dialog('cornerButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Corner')).endDialog;
    }
]).triggerAction({ matches: /corner/i });

// Add dialog to handle button click
bot.dialog('freeKickButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Free Kick')).endDialog;
    }
]).triggerAction({ matches: /free kick/i });

// Add dialog to handle button click
bot.dialog('penaltyKickButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Penalty')).endDialog;
    }
]).triggerAction({ matches: /penalty kick/i });

// Add dialog to handle button click
bot.dialog('fouledButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Fouled')).endDialog;
    }
]).triggerAction({ matches: /fouled/i });

// Add dialog to handle button click
bot.dialog('committedFoulButtonClick', [
    function (session) {
        session.beginDialog(processButtonClick(session, 'Committed Foul')).endDialog;
    }
]).triggerAction({ matches: /committed foul/i });

// Add dialog to handle button click
bot.dialog('kickOffButtonClick', [
    function (session,args,next) {
        session.userData.kickOffCount ++;

        if (session.userData.playerNumber == null || session.userData.playerNumber == undefined)
            {session.beginDialog('askForPlayerNumber')}
        else {next()}
    },
    function (session,args,next) {
        if (session.userData.matchState == 'Pre-Game') 
            {
                updateElapsedTime(session,'Kick Off 1st Half');
                logResponse (session, session.userData.playerNumber, 'Kick Off 1st Half');
                session.userData.matchState = '1st Half';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                // session.beginDialog('inGameTracking');
            }
        if (session.userData.matchState == 'Half Time') 
            {
                updateElapsedTime(session,'Kick Off 2nd Half');
                logResponse (session, session.userData.playerNumber, 'Kick Off 2nd Half');
                session.userData.matchState = '2nd Half';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                // session.beginDialog('inGameTracking');
            }
        if (session.userData.matchState == 'Full Time') 
            {
                updateElapsedTime(session,'Kick Off 1st Half Extra Time');
                logResponse (session, session.userData.playerNumber, 'Kick Off 1st Half Extra Time');
                session.userData.matchState = '1st Half Extra Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                // session.beginDialog('inGameTracking');
            }
        if (session.userData.matchState == 'Half Time Extra Time') 
            {
                updateElapsedTime(session,'Kick Off 2nd Half Extra Time');
                logResponse (session, session.userData.playerNumber, 'Kick Off 2nd Half Extra Time');
                session.userData.matchState = '2nd Half Extra Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
                // session.beginDialog('inGameTracking');
            }
        session.beginDialog('inGameTracking').endDialog();
    }
]).triggerAction({ matches: /kick off/i });

// Add dialog to handle button click
bot.dialog('finalWhistleButtonClick', [
    function (session) {

        if (session.userData.matchState == '1st Half') 
            {
                session.userData.finalWhistleCount ++;
                updateElapsedTime(session,'Final Whistle');
                logResponse (session, session.userData.playerNumber, 'Final Whistle 1st Half');
                session.userData.matchState = 'Half Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
            }
        if (session.userData.matchState == '2nd Half') 
            {
                session.userData.finalWhistleCount ++;
                updateElapsedTime(session,'Final Whistle');
                logResponse (session, session.userData.playerNumber, 'Final Whistle 2nd Half');
                session.userData.matchState = 'Full Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
            }
        if (session.userData.matchState == '1st Half Extra Time') 
            {
                session.userData.finalWhistleCount ++;
                updateElapsedTime(session,'Final Whistle');
                logResponse (session, session.userData.playerNumber, 'Final Whistle 1st Half Extra Time');
                session.userData.matchState = 'Half Time Extra Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
            }
        if (session.userData.matchState == '2nd Half Extra Time') 
            {
                session.userData.finalWhistleCount ++;
                updateElapsedTime(session,'Final Whistle');
                logResponse (session, session.userData.playerNumber, 'Final Whistle 2nd Half Extra Time');
                session.userData.matchState = 'Full Time Extra Time';
                console.log('Match State Changed >>>>' + session.userData.matchState);
            }
        session.beginDialog('playerAndGameDetails').endDialog();

    }
]).triggerAction({ matches: /final whistle/i });

// web interface
server.get('/', restify.serveStatic({
 directory: __dirname,
 default: '/index.html',
}));
// server.get('/api/CustomWebApi', (req, res, next) => {
//     startProactiveDialog(savedAddress);
//     // sendProactiveMessage(savedAddress);
//     res.send('triggered');
//     next();
//   }
// );

initialLogEntry = new logData();



