var dbDef = require('../index.js');

exports = module.exports = function () {};

exports.insert = function (rows, dbResponse) {

    dbDef(function (err, db) {

        function insertDocument(db, rows, callback) {

            db.collection("ITOrders")
                .insert(rows, function (err, result) {

                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    if (!err) {
                        var response = ("Inserted document: ", rows, " into the collection.");
                        callback(null, response);
                    }
                });
        };

        insertDocument(db, rows, function (err, res) {
            if (err) {
                dbResponse(err, null);
            }
            if (!err) {
                dbResponse(null, res);
            }
        });
    });
}