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
app.post('/track', function (req, res) {

  var fedex = new fedexAPI({
    environment: 'sandbox', // or live
    debug: true,
    key: 'm6V9MCeAJClXOJ0t',
    password: '5U1RdXE7rvlo5tMeBb6vQb49S',
    account_number: '510087186',
    meter_number: '118754438',
    imperial: true // set to false for metric
  });

  console.log(req.body.value);

  var fedExOptions = {
    SelectionDetails: {
      PackageIdentifier: {
        Type: 'TRACKING_NUMBER_OR_DOORTAG',
        Value: req.body.value
      }
    }
  }

  var exportObject = {};

  fedex.track(fedExOptions, function (err, result) {
    if (err) {
      return console.log(err);
    } else {
      exportObject.Message = result.CompletedTrackDetails[0].Notifications[0].Message;
      exportObject.TrackingNumber = result.CompletedTrackDetails[0].TrackDetails[0].TrackingNumber;
      exportObject.TrackingNumberUniqueIdentifier = result.CompletedTrackDetails[0].TrackDetails[0].TrackingNumberUniqueIdentifier;
      exportObject.ServiceCommitMessage = result.CompletedTrackDetails[0].TrackDetails[0].ServiceCommitMessage;
      exportObject.CarrierCode = result.CompletedTrackDetails[0].TrackDetails[0].CarrierCode;
      exportObject.OperatingCompanyOrCarrierDescription = result.CompletedTrackDetails[0].TrackDetails[0].OperatingCompanyOrCarrierDescription;
      exportObject.ShipperAddress = result.CompletedTrackDetails[0].TrackDetails[0].ShipperAddress;
      exportObject.ShipTimestamp = result.CompletedTrackDetails[0].TrackDetails[0].ShipTimestamp;
      exportObject.StatusUpdateTime = result.CompletedTrackDetails[0].TrackDetails[0].StatusDetail.Description;
      exportObject.statusCode = result.CompletedTrackDetails[0].TrackDetails[0].StatusDetail.Code;
      exportObject.statusLocation = result.CompletedTrackDetails[0].TrackDetails[0].StatusDetail.Location;

      console.log(result.CompletedTrackDetails[0].TrackDetails[0].DestinationAddress);
      res.send(exportObject);
    }
  });
});

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

app.get('/delete', function (req, res) {
  var deleteDoc = req.body.deleteDoc = "58346d53c1ae052b0446b972";
  db.delete(deleteDoc, function (err, deleteRes) {
    if (err) {
      res.send(err);
    }
    if (!err) {
      console.log(deleteRes)
      res.send(deleteRes);
    }
  })
});