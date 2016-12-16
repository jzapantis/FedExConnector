/*eslint-env node*/

var request = require('request');
var express = require('express');
var cfenv = require('cfenv');
var app = express();
var appEnv = cfenv.getAppEnv();
var bodyParser = require('body-parser');
var Cloudant = require('cloudant');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
  extended: true
})); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.text());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.listen(appEnv.port, '0.0.0.0', function () {
  console.log("server starting on " + appEnv.url);
});
////////////////////////////////////////

var db = require('./lib/db/crud/index.js');
var fedEx = require('./lib/fedEx/tracking.js');

////////////////////////////////////////
app.post('/addForm', function (req, res) {
  var doc = req.body;
  var newTrackingNumbers = doc.trackingNumbers;
  console.log("type of incoming tracking numbers variable: ", typeof newTrackingNumbers)
  console.log("its says object, so lets see the keys: ", Object.keys(newTrackingNumbers))
  console.log("the first tracking number in the list: ", newTrackingNumbers[0])
  var insertDocs = [];
  console.log("in endpoint, req.body = ", req.body)
  console.log("back-end received an array of tracking numbers: ", req.body.trackingNumbers)
  var insertDoc = {
    timeStamp: "",
    trackingNumber: "",
    email: ""
  };
  console.log("quantity of new inserts: ", newTrackingNumbers.length)
  for (var i = 0; i < newTrackingNumbers.length; i++) {
    console.log("NEW INSERT ####################")
    insertDoc.timeStamp = doc.timeStamp;
    insertDoc.email = doc.submissionEmail;
    insertDoc.trackingNumber = newTrackingNumbers[i];
    console.log("document being inserted into the DB: ", insertDoc)
    console.log("current tracking number being inserted: ", newTrackingNumbers[i])
    insertDocs.push(insertDoc);
  }
  db.create(insertDocs, function (err, insertRes) {
    if (err) {
      res.send(err);
    }
    if (!err) {
      res.send(insertRes);
    }
  });
});

app.post('/addUI', function (req, res) {

  var trackingNumbers = req.body.trackingNumbers;
  var formattedTrackingNumbers = trackingNumbers.split(/\r\n|\r|\n|,|;|\s+/g);

  var date = new Date();
  var hr = date.getHours();
  var d = date.getDate();
  var m = date.getMonth();
  var yr = date.getFullYear();

  var insertDocs = [];

  console.log("quantity of new inserts: ", formattedTrackingNumbers.length)
  for (var i = 0; i < formattedTrackingNumbers.length; i++) {
    var insertDoc = {
      timeStamp: date,
      hour: hr,
      day: d,
      month: m,
      year: yr,
      trackingNumber: ""
    };
    console.log("#################### NEW INSERT OBJECT - ", i, " ####################")
    insertDoc.trackingNumber = formattedTrackingNumbers[i];
    insertDocs.push(insertDoc);
  }
  console.log("")
  console.log("ARRAY PASSED TO CRUD MODULE: ")
  console.log(insertDocs)
  console.log("")
  console.log("INSERTING......")

  db.create(insertDocs, "ORDERS_MASTER", function (err, insertRes) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    if (!err) {
      console.log("INSERT SUCCESS");
      res.send(insertRes);
    }
  });
});

app.get('/getTrackingNumbers', function (req, res) {
  var queryParams = "";
  db.read(queryParams, function (err, readRes) {
    if (err) {
      res.send(err);
    }
    if (!err) {
      fedEx.track(readRes, function (err, trackingRes) {
        if (err) {
          res.send(err);
        }
        if (!err) {
          console.log("Tracking Numbers loaded successfully")
          res.send(trackingRes);
        }
      })

    }
  })
});

app.post('/delete', function (req, res) {
  console.log("")
  console.log("deleteObj received: ", req.body)
  console.log("")
  var body = req.body.trackingNumber;
  db.delete(body, function (err, deleteRes) {
    if (err) {
      res.send(err);
    }
    if (!err) {
      res.send(deleteRes);
    }
  })
});

app.post('/archive', function (req, res) {
  console.log("")
  console.log("archiveObj received: ", req.body)
  console.log("")

  var doc = [];
  doc.push({trackingNumber: req.body.trackingNumbers})

  db.create(doc, "ARCHIVED_TRACKING_NUMBERS", function (err, insertRes) {
    if (err) {
      console.log(err);
      res.send(err);
    }
    if (!err) {
      console.log("ARCHIVE INSERT SUCCESS");
      console.log("")
      console.log(doc[0].trackingNumber)
      db.delete(doc[0].trackingNumber, function (err, deleteRes) {
        if (err) {
          res.send(err);
        }
        if (!err) {
          console.log("DELETED: ", req.body.trackingNumbers, " from ORDERS_MASTER and ARCHIVED it")
          res.send(deleteRes);
        }
      })
    }
  });
});
