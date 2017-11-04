var config = {}

config.endpoint = process.env.CosmosDB_Endpoint ; 
config.primaryKey = process.env.CosmosDB_Key ; 

config.database = {
    "id": "PlayerTrackingDB"
};

config.collection = {
    // "id": "G04Copa2017"
    "id": "V2 Data Structure"
    // "id": "V2 Testing"
};



module.exports = config;