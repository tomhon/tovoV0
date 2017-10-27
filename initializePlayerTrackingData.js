//Deletes all game data and initializes tracking variables
module.exports = function initializePlayerTrackingData(session) {
    var date = new Date();
    session.userData.gameId = date,
    console.log('New Game Id set >>>>' + session.userData.gameId);
    session.userData.matchState = 'Pre-Game';
    session.userData.playerTeamHomeAway = 'Home'; 
    session.userData.opponentTeam = 'Unknown';
    session.userData.opponentClub = 'Unknown';
    session.userData.gameLocation = 'Unknown';
    session.userData.gameField = 'Unknown';
    session.userData.totalPlayerElapsedTime = 0;
    session.userData.totalGameElapsedTime = 0;
    session.userData.completedPassCount = 0;
    session.userData.attemptedPassCount = 0;
    session.userData.successfulDribbleCount = 0;
    session.userData.attemptedDribbleCount = 0;
    session.userData.successfulTackleCount = 0;
    session.userData.attemptedTackleCount = 0;
    session.userData.shotCount = 0;
    session.userData.shotOnFrameCount = 0;
    session.userData.shotOffFrameCount = 0;
    session.userData.goalCount = 0;
    session.userData.inSpaceCount = 0;
    session.userData.scanningCount = 0;
    session.userData.substitutedInCount = 0;
    session.userData.susbstitutedOutCount = 0;
    session.userData.cornerCount = 0;
    session.userData.freeKickCount = 0;
    session.userData.penaltyKickCount = 0;
    session.userData.fouledCount = 0;
    session.userData.committedFoulCount = 0;
    session.userData.kickOffCount = 0;
    session.userData.finalWhistleCount = 0;
    session.userData.assistCount = 0;
    console.log('Game Tracking Data Initialized');
};