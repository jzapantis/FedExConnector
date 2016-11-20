// Retrieve
var MongoClient = require('mongodb').MongoClient;

module.exports = function (callback) {
    console.log(`
    ##########
    in connection function`)
    // Connect to the db
    MongoClient.connect("mongodb://localhost:27017/PwCLocalMongoDB", function (err, db) {
        console.log("trying to connect")
        if (err) {
            callback(err, null);
        }
        if (!err) {
            console.log("DB connection successful")
            callback(null, db);
        }

    });

}