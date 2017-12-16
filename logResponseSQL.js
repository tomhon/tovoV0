// var config = require("./config");
var matchInProgress = require("./matchInProgress");

module.exports = function logResponse (session, player, status) {
    var date = new Date();
    session.userData.id = date.toISOString();
    session.userData.status = status;
    session.userData.user = session.message.user.name;
    console.log('attempting write to sql');
    console.log('Match in Progress = ' + matchInProgress(session))
    executeSQLInsert(session.userData)
        .then(()  =>   console.log(session.userData))
        .catch((error) => { console.log(`Completed with error ${JSON.stringify(error)}`) });


}

var Connection = require('tedious').Connection; 

var config = {  
    userName: 'Liverpool',  
    password: 'Russia2018',  
    server: 'playertracking.database.windows.net',  
    // If you are on Azure SQL Database, you need these next options.  
    options: {encrypt: true, database: 'playertracking'}  
};  

var connection = new Connection(config);  

connection.on('connect', function(err) {  
    // If no error, then good to proceed.  
    console.log("Connected");  
});  

    var Request = require('tedious').Request  
    var TYPES = require('tedious').TYPES;  

    function executeSQLInsert(userData) {  
        request = new Request("INSERT SalesLT.Product (Name, ProductNumber, StandardCost, ListPrice, SellStartDate) OUTPUT INSERTED.ProductID VALUES (@Name, @Number, @Cost, @Price, CURRENT_TIMESTAMP);", function(err) {  
         if (err) {  
            console.log(err);}  
        });  
        request.addParameter('Name', TYPES.NVarChar,'SQL Server Express 2014');  
        request.addParameter('Number', TYPES.NVarChar , 'SQLEXPRESS2014');  
        request.addParameter('Cost', TYPES.Int, 11);  
        request.addParameter('Price', TYPES.Int,11);  
        request.on('row', function(columns) {  
            columns.forEach(function(column) {  
              if (column.value === null) {  
                console.log('NULL');  
              } else {  
                console.log("Product id of inserted item is " + column.value);  
              }  
            });  
        });       
        connection.execSql(request);  
    }