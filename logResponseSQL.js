// var config = require("./config");
var matchInProgress = require("./matchInProgress");

var Connection = require('tedious').Connection; 
var Request = require('tedious').Request  
var TYPES = require('tedious').TYPES;  

var config = {  
    userName: process.env.SQLusername ,  
    password: process.env.SQLpassword ,  
    server: process.env.SQLServer ,  
    // If you are on Azure SQL Database, you need these next options.  
    options: {encrypt: true, database: process.env.SQLdb }  
};  



module.exports = function logResponse (session, player, status) {
// function logResponse (session, player, status) {
    var date = new Date();
    session.userData.id = date.toISOString();
    session.userData.status = status;
    session.userData.user = session.message.user.name;
    console.log('Connecting to SQL');
    // console.log('Match in Progress = ' + matchInProgress(session))

    //initialize SQL connection
    var connection = new Connection(config);  

    //when connection comes up 
    connection.on('connect', function(err) {  
        if (err) {
            console.log(err); 
        } else {
            //if successful execute insert
            console.log("Connected to SQL"); 
            sqlInsertString = createSQLRequest(session.userData);
            executeSQLInsert(sqlInsertString);
        }
    }); 

    function executeSQLInsert(sqlString) {
        console.log('Executing SQL Insert');
        request = new Request(sqlString, function(err) {  
                if (err) {  
                console.log(err);
                console.log(sqlString);

                }  
            });  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
                if (column.value === null) {  
                console.log('NULL');  
                } else {  
                console.log("id of inserted item is " + column.value);  
                }  
            });  
        });       
        connection.execSql(request);  
    }

 
};  


function createSQLRequest(userData) {
    sqlRequestString = "INSERT INTO dbo.trackingTable (";
    // sqlRequestString = "INSERT INTO dbo.trackingTable (id,";
            sqlRequestString += "assistCount,";
            sqlRequestString += "attemptedDribbleCount,";
            sqlRequestString += "attemptedPassCount,";
            sqlRequestString += "attemptedTackleCount,";
            sqlRequestString += "committedFoulCount,";
            sqlRequestString += "completedPassCount,";
            sqlRequestString += "cornerCount,";
            sqlRequestString += "finalWhistleCount,";
            sqlRequestString += "fouledCount,";
            sqlRequestString += "freeKickCount,";
            sqlRequestString += "gameField,";
            sqlRequestString += "gameId,";
            sqlRequestString += "gameLocation,";
            sqlRequestString += "goalCount,";
            sqlRequestString += "inSpaceCount,";
            sqlRequestString += "kickOffCount,";
            sqlRequestString += "matchState,";
            sqlRequestString += "mostRecentGameStartTime,";
            sqlRequestString += "mostRecentPlayerStartTime,";
            sqlRequestString += "mostRecentStartTime,";
            sqlRequestString += "opponentClub,";
            sqlRequestString += "opponentTeam,";
            sqlRequestString += "penaltyKickCount,";
            sqlRequestString += "playerClub,";
            sqlRequestString += "playerInOut,";
            sqlRequestString += "playerName,";
            sqlRequestString += "playerNumber,";
            sqlRequestString += "playerTeam,";
            sqlRequestString += "playerTeamAwayHome,";
            sqlRequestString += "scanningCount,";
            sqlRequestString += "shotCount,";
            sqlRequestString += "shotOffFrameCount,";
            sqlRequestString += "shotOnFrameCount,";
            sqlRequestString += "status,";
            sqlRequestString += "substitutedInCount,";
            sqlRequestString += "substitutedOutCount,";
            sqlRequestString += "successfulDribbleCount,";
            sqlRequestString += "successfulTackleCount,";
            sqlRequestString += "totalElapsedTime,";
            sqlRequestString += "totalGameElapsedTime,";
            sqlRequestString += "totalPlayerElapsedTime,";
            sqlRequestString += "userName) ";
        sqlRequestString += "VALUES ("
            // sqlRequestString += "DEFAULT" + ",";
            sqlRequestString += "'" + userData.assistCount  + "',";
            sqlRequestString += "'" + userData.attemptedDribbleCount  + "',";
            sqlRequestString += "'" + userData.attemptedPassCount  + "',";
            sqlRequestString += "'" + userData.attemptedTackleCount  + "',";
            sqlRequestString += "'" + userData.committedFoulCount  + "',";
            sqlRequestString += "'" + userData.completedPassCount  + "',";
            sqlRequestString += "'" + userData.cornerCount  + "',";
            sqlRequestString += "'" + userData.finalWhistleCount  + "',";
            sqlRequestString += "'" + userData.fouledCount  + "',";
            sqlRequestString += "'" + userData.freeKickCount  + "',";
            sqlRequestString += "'" + userData.gameField  + "',";
            sqlRequestString += "'" + userData.gameId  + "',";
            sqlRequestString += "'" + userData.gameLocation  + "',";
            sqlRequestString += "'" + userData.goalCount  + "',";
            sqlRequestString += "'" + userData.inSpaceCount  + "',";
            sqlRequestString += "'" + userData.kickOffCount  + "',";
            sqlRequestString += "'" + userData.matchState + "',";
            sqlRequestString += "'" + userData.mostRecentGameStartTime + "',";
            sqlRequestString += "'" + userData.mostRecentPlayerStartTime + "',";
            sqlRequestString += "'" + userData.mostRecentStartTime + "',";
            sqlRequestString += "'" + userData.opponentClub  + "',";
            sqlRequestString += "'" + userData.opponentTeam  + "',";
            sqlRequestString += "'" + userData.penaltyKickCount  + "',";
            sqlRequestString += "'" + userData.playerClub  + "',";
            sqlRequestString += "'" + userData.playerInOut  + "',";
            sqlRequestString += "'" + userData.playerName  + "',";
            sqlRequestString += "'" + userData.playerNumber  + "',";
            sqlRequestString += "'" + userData.playerTeam  + "',";
            sqlRequestString += "'" + userData.playerTeamHomeAway  + "',";
            sqlRequestString += "'" + userData.scanningCount  + "',";
            sqlRequestString += "'" + userData.shotCount  + "',";
            sqlRequestString += "'" + userData.shotOffFrameCount  + "',";
            sqlRequestString += "'" + userData.shotOnFrameCount  + "',";
            sqlRequestString += "'" + userData.status  + "',";
            sqlRequestString += "'" + userData.substitutedInCount  + "',";
            sqlRequestString += "'" + userData.substitutedOutCount  + "',";
            sqlRequestString += "'" + userData.successfulDribbleCount  + "',";
            sqlRequestString += "'" + userData.successfulTackleCount  + "',";
            sqlRequestString += "'" + userData.totalElapsedTime  + "',";
            sqlRequestString += "'" + userData.totalGameElapsedTime  + "',";
            sqlRequestString += "'" + userData.totalPlayerElapsedTime  + "',";
            sqlRequestString += "'" + userData.user  + "')";
    return sqlRequestString;
}