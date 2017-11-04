var matchInProgress = require("./matchInProgress");
var logResponse = require("./logResponse");
var initializePlayerTrackingData = require("./initializePlayerTrackingData");
var updateElapsedTime = require("./updateElapsedTime");

module.exports = function processButtonClick(session, action) {
    if (matchInProgress(session)) {
        switch (action) {
            case 'Completed Pass': {
                session.userData.completedPassCount ++;
                session.userData.attemptedPassCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Attempted Pass': {
                session.userData.attemptedPassCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Successful Dribble': {
                session.userData.successfulDribbleCount ++;
                session.userData.attemptedDribbleCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Attempted Dribble': {
                session.userData.attemptedDribbleCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Successful Tackle': {
                session.userData.successfulTackleCount ++;
                session.userData.attemptedTackleCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Attempted Tackle': {
                session.userData.attemptedTackleCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Shot': {
                session.userData.shotCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }   
            case 'Shot on Frame': {
                session.userData.shotOnFrameCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }   
            case 'Shot off Frame': {
                session.userData.shotOffFrameCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }   
            case 'Goal': {
                session.userData.goalCount ++;
                session.userData.shotCount ++;
                session.userData.shotOnFrameCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Assist': {
                session.userData.assistCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'In Space': {
                session.userData.inSpaceCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                    }
            case 'Scanning': {
                session.userData.scanningCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                        }
            case 'Substituted In': {
                session.userData.substitutedInCount ++;
                updateElapsedTime(session, 'Substituted In');
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Substituted Out': {
                session.userData.susbstitutedOutCount ++;
                updateElapsedTime(session, 'Substituted Out');
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Corner': {
                session.userData.cornerCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Free Kick': {
                session.userData.freeKickCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Penalty': {
                session.userData.penaltyKickCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Fouled': {
                session.userData.fouledCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }
            case 'Committed Foul': {
                session.userData.committedFoulCount ++;
                logResponse (session, session.userData.playerNumber, action);
                break;
                }                                                                    
            default: {console.log('Match In Progress - no Action Taken');
            break;
                }
            }
        // next dialog is inGameTracking
        return 'inGameTracking';
        }
    //Match NOT in Progress
    else {
        switch (action) {
            case 'Delete Player Data': {
                session.userData.playerName = 'Unknown';
                session.userData.playerNumber = 'Unknown';
                session.userData.playerTeam = 'Unknown';
                session.userData.playerClub = 'Unknown';
                initializePlayerTrackingData(session);
                logResponse (session, session.userData.playerNumber, action);
                session.send('Player Data Details Initialized');
                break;
                }
            case 'Delete Game Data': {
                initializePlayerTrackingData(session);
                logResponse (session, session.userData.playerNumber, action);
                session.send('Game Details Initialized');
                break;
                }
            default: {console.log('Match NOT In Progress - no Action Taken')};

        }
        // next dialog is playerAndGameDetails
        return 'playerAndGameDetails';
    }
 
};