//Deletes all game data and initializes tracking variables
module.exports = function initializePlayerTrackingData(session) {
    var date = new Date();
    session.userData.gameId = date,
    console.log('New Game Id set >>>>' + session.userData.gameId);
    session.userData.assistCount = 0;
    session.userData.attemptedDribbleCount = 0;
    session.userData.attemptedPassCount = 0;
    session.userData.attemptedTackleCount = 0;
    session.userData.committedFoulCount = 0;
    session.userData.completedPassCount = 0;
    session.userData.cornerCount = 0;
    session.userData.finalWhistleCount = 0;
    session.userData.fouledCount = 0;
    session.userData.freeKickCount = 0;
    session.userData.gameField = 'Unknown';
    session.userData.gameLocation = 'Unknown';
    session.userData.goalCount = 0;
    session.userData.inSpaceCount = 0;
    session.userData.kickOffCount = 0;
    session.userData.matchState = 'Pre-Game';
    session.userData.mostRecentGameStartTime= 0;
    session.userData.mostRecentPlayerStartTime= 0;
    session.userData.mostRecentStartTime= 0;
    session.userData.opponentClub = 'Unknown';
    session.userData.opponentTeam = 'Unknown';
    session.userData.penaltyKickCount = 0;
    session.userData.playerClub = 'test';
    session.userData.playerInOut= 'assumedIn';
    session.userData.playerName= 'test player';
    session.userData.playerNumber = 99;
    session.userData.playerTeam= 'test';
    session.userData.playerTeamHomeAway = 'Home'; 
    session.userData.scanningCount = 0;
    session.userData.shotCount = 0;
    session.userData.shotOffFrameCount = 0;
    session.userData.shotOnFrameCount = 0;
    session.userData.status= 'test';
    session.userData.substitutedInCount = 0;
    session.userData.substitutedOutCount = 0;
    session.userData.successfulDribbleCount = 0;
    session.userData.successfulTackleCount = 0;
    session.userData.totalElapsedTime = 0;
    session.userData.totalGameElapsedTime = 0;
    session.userData.totalPlayerElapsedTime = 0;
    
    
    console.log('Game Tracking Data Initialized');
};





