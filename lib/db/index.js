var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    //   BSON = require('mongodb').pure().BSON, // ---- NOT WORKING FOR SOME REASON
    assert = require('assert');

module.exports = function(callback) {
    var db = new Db('IT_ORDERS', new Server('localhost', 27017)); // what should be the first parameter of the Db("?", )
    db.open(function(err, db) {
        if (err) {
            console.log(err, null);
        }
        if (!err) {
            callback(null, db);
        }
    });
}