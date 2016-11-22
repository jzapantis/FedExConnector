var dbDef = require('../index.js');

exports = module.exports = function () { };

exports.create = function (insertDocs, dbResponse) {
  dbDef(function (err, db) {
    var col = db.collection('ORDERS_MASTER');
    var batch = col.initializeUnorderedBulkOp({ useLegacyOps: true });
    for (var i = 0; i < insertDocs.length; i++) {
      batch.insert(insertDocs[i]);
    }
    batch.execute(function (err, result) {
      if (err) {
        console.log("insertError: ", err);
        dbResponse(err, null);
      }
      if (!err) {
        dbResponse(null, result);
        db.close();
      }
    });
  });
};

exports.read = function (queryParams, dbResponse) {
  dbDef(function (err, db) {
    db.collection('ORDERS_MASTER', function (err, collection) {
      if (queryParams == "") {
        collection.find().toArray(function (err, items) {
          if (err) {
            console.log(err);
            dbResponse(err, null);
          } else {
            console.log(items[0]);
            dbResponse(null, items[0]);
            db.close();
          }
        });
      }
    });
  });
};

exports.delete = function (deleteDocs, dbResponse) {
  dbDef(function (err, db) {
    db.collection('ORDERS_MASTER', {}, function (err, contacts) {
      contacts.remove({ _id: ObjectID("52b2f757b8116e1df2eb46ac") }, function (err, result) {
        if (err) {
          console.log(err);
          dbResponse(err, null);
        } else {
          console.log(result);
          db.close();
        }
      });
    });
  });
}

