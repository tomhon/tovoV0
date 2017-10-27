module.exports = function matchInProgress(session) {
    if (session.userData.matchState === '1st Half' || session.userData.matchState === '2nd Half' )
        {return true}
        else {return false};
}