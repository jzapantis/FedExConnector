var dbDef = require('../index.js');

exports = module.exports = function () { };

exports.insert = function (rows, dbResponse) {

    dbDef(function (err, db) {
        if (!err) {
            console.log(`
            #########
            in dbDef`)
                var ITOrders = db.collection("ITOrders")
                var bulk = ITOrders.initializeUnorderedBulkOp();

                console.log("beggining to build bulk insert task")
                for (var i = 0; i < rows.length; i++) {
                    bulk.insert(rows[i]);
                }
                bulk.execute();
        }
    });
};

