module.exports = function addNewVariablesToUserData(session) {
    var date = new Date();
    if (!session.userData.gameId) {session.userData.gameId = date};
    console.log('New Game Id set >>>>' + session.userData.gameId);
    if (!session.userData.assistCount) {session.userData.assistCount = 0};
    if (!session.userData.attemptedDribbleCount) {session.userData.attemptedDribbleCount = 0};
    if (!session.userData.attemptedPassCount) {session.userData.attemptedPassCount = 0};
    if (!session.userData.attemptedTackleCount) {session.userData.attemptedTackleCount = 0};
    if (!session.userData.committedFoulCount) {session.userData.committedFoulCount = 0};
    if (!session.userData.completedPassCount) {session.userData.completedPassCount = 0};
    if (!session.userData.cornerCount) {session.userData.cornerCount = 0};
    if (!session.userData.finalWhistleCount) {session.userData.finalWhistleCount = 0};
    if (!session.userData.fouledCount) {session.userData.fouledCount = 0};
    if (!session.userData.freeKickCount) {session.userData.freeKickCount = 0};
    if (!session.userData.gameField) {session.userData.gameField = 'Unknown'};
    if (!session.userData.gameLocation) {session.userData.gameLocation = 'Unknown'};
    if (!session.userData.goalCount) {session.userData.goalCount = 0};
    if (!session.userData.inSpaceCount) {session.userData.inSpaceCount = 0};
    if (!session.userData.kickOffCount) {session.userData.kickOffCount = 0};
    if (!session.userData.matchState) {session.userData.matchState = 'Pre-Game'};
    if (!session.userData.mostRecentGameStartTime) {session.userData.mostRecentGameStartTime= 0};
    if (!session.userData.mostRecentPlayerStartTime) {session.userData.mostRecentPlayerStartTime= 0};
    if (!session.userData.mostRecentStartTime) {session.userData.mostRecentStartTime= 0};
    if (!session.userData.opponentClub) {session.userData.opponentClub = 'Unknown'};
    if (!session.userData.opponentTeam) {session.userData.opponentTeam = 'Unknown'};
    if (!session.userData.penaltyKickCount) {session.userData.penaltyKickCount = 0};
    if (!session.userData.playerClub) {session.userData.playerClub = 'test'};
    if (!session.userData.playerInOut) {session.userData.playerInOut= 'In Assumed'};
    if (!session.userData.playerName) {session.userData.playerName= 'test player'};
    if (!session.userData.playerNumber) {session.userData.playerNumber = 99};
    if (!session.userData.playerTeam) {session.userData.playerTeam= 'test'};
    if (!session.userData.playerTeamHomeAway) {session.userData.playerTeamHomeAway = 'Home'}; 
    if (!session.userData.scanningCount) {session.userData.scanningCount = 0};
    if (!session.userData.shotCount) {session.userData.shotCount = 0};
    if (!session.userData.shotOffFrameCount) {session.userData.shotOffFrameCount = 0};
    if (!session.userData.shotOnFrameCount) {session.userData.shotOnFrameCount = 0};
    if (!session.userData.status) {session.userData.status= 'test'};
    if (!session.userData.substitutedInCount) {session.userData.substitutedInCount = 0};
    if (!session.userData.substitutedOutCount) {session.userData.substitutedOutCount = 0};
    if (!session.userData.successfulDribbleCount) {session.userData.successfulDribbleCount = 0};
    if (!session.userData.successfulTackleCount) {session.userData.successfulTackleCount = 0};
    if (!session.userData.totalElapsedTime) {session.userData.totalElapsedTime = 0};
    if (!session.userData.totalGameElapsedTime) {session.userData.totalGameElapsedTime = 0};
    if (!session.userData.totalPlayerElapsedTime) {session.userData.totalPlayerElapsedTime = 0};
    
    
    console.log('added new variables');
};