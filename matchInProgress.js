module.exports = function matchInProgress(session) {
    if (session.userData.matchState === '1st Half' || session.userData.matchState === '2nd Half' || session.userData.matchState === '1st Half Extra Time'|| session.userData.matchState === '2nd Half Extra Time' )
        {return true}
        else {return false};
}