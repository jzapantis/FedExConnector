/*eslint-env node*/

var request = require('request');
var express = require('express');
var cfenv = require('cfenv');
var app = express();
var appEnv = cfenv.getAppEnv();
var bodyParser = require('body-parser');
var fedexAPI = require('shipping-fedex');
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

////////////////////////////////////////
app.post('/testGoogle', function (req, res) {
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

app.get('/getTrackingNumbers', function (req, res) {
  var queryParams = "";
  db.read(queryParams, function (err, readRes) {
    if (err) {
      res.send(err);
    }
    if (!err) {
      res.send(readRes);
    }
  })
});