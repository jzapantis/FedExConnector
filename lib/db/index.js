// Retrieve
var MongoClient = require('mongodb').MongoClient;

module.exports = function (callback) {

    // Connect to the db
    MongoClient.connect("mongodb://localhost:27017/PwCLocalMongoDB", function (err, db) {
        if (err) {
            callback(err, null);
        }
        if (!err) {
            callback(null, db);
        }

    });

}