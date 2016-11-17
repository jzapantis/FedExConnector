/*eslint-env node*/

var request = require('request');
var express = require('express');
var cfenv = require('cfenv');
var app = express();
var appEnv = cfenv.getAppEnv();
var bodyParser = require('body-parser');
var fedexAPI = require('shipping-fedex');

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
var db = require("./lib/db/crud/index.js");
////////////////////////////////////////
app.post('/testGoogle', function (req, res) {
  var doc = req.body;
  var newTrackingNumbers = doc.trackingNumbers;
  var rawTrackingNumbers = [];

  if (req.body.type === "array") {

    var insertDoc = {
      timeStamp: "",
      trackingNumber: "",
      email: ""
    };

    for (var i = 0; i < newTrackingNumbers.length; i++) {
      insertDoc.timestamp = doc.timeStamp;
      insertDoc.email = doc.submissionEmail;
      insertDoc.trackingNumber = newTrackingNumbers[i];

      db.insert(insertDoc, function (err, res) {
        if (err) {
          console.log('[fedEx.insert error] ', err);
          res.send("error: ", err);
          return
        }
        if (!err) {
          rawTrackingNumbers.push = newTrackingNumbers[i];
          console.log(rawTrackingNumbers[i]);
        }
      });
    }
    console.log(rawTrackingNumbers);
    res.send(rawTrackingNumbers);

  } else {
    db.insert(insertDoc, function (err, res) {
      if (err) {
        console.log('[mongoDB insert error] ', err);
        res.send("error: ", err);
      }
      if (!err) {
        console.log(body.trackingNumbers);
        res.send(body.trackingNumbers);
      }
    });
  }
});