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
var db = require("./lib/db/crud/index.js")
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

app.get('/getTrackingNumbers', function (req, res) {

  var usr = '148f1d3e-9ac8-4b76-be8b-5f89ee464ffc-bluemix';
  var pwd = 'e96ccc3165556303402511e315c0b52cd9bbcbc5d48042697ad122e0646db1aa';

  var cloudant = Cloudant({
    account: usr,
    password: pwd
  });

  var fedEx = cloudant.db.use('tracking-numbers');

  var query = {
    "selector": {
      "_id": {
        "$gt": 0
      }
    },
    "sort": [{
      "_id": "asc"
    }]
  }

  fedEx.find(query, function (error, result) {
    if (error) {
      console.log("Request did not return a 200, or there was error: ", error);
      res.send("error: ", error)
    }
    if (!error) {
      console.log(result);
      res.send(result);
    }
    return;
  });
});

app.post('/addTrackingNumber', function (req, res) {

  var usr = '148f1d3e-9ac8-4b76-be8b-5f89ee464ffc-bluemix';
  var pwd = 'e96ccc3165556303402511e315c0b52cd9bbcbc5d48042697ad122e0646db1aa';

  var cloudant = Cloudant({
    account: usr,
    password: pwd
  });

  var fedEx = cloudant.db.use('tracking-numbers');

  doc = req.body;
  console.log(req.body)

  fedEx.insert(doc, function (err, body, header) { // This one only inserts one document
    if (err) {
      console.log('[fedEx.insert error] ', err);
      res.send("error: ", err);
    }
    if (!err) {
      console.log(body);
      res.send(body);
    }
    return;
  });
});

app.post('/delete', function (req, res) {

  var docID = req.body["_id"];
  var revNumber = req.body["_rev"];

  var usr = '148f1d3e-9ac8-4b76-be8b-5f89ee464ffc-bluemix';
  var pwd = 'e96ccc3165556303402511e315c0b52cd9bbcbc5d48042697ad122e0646db1aa';

  request.del('https://' + usr + ':' + pwd + '@' + '148f1d3e-9ac8-4b76-be8b-5f89ee464ffc-bluemix.cloudant.com/tracking-numbers' + '/' + docID + '?rev=' + revNumber, function (error, response, body) {

    if (!error) {
      console.log(body);
      res.send(body);
    }
    if (error) {
      console.log(error);
      res.send(error);
    }
  });
});

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

      fedEx.insert(insertDoc, function (err, body, header) { // This one only inserts one document
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
    fedEx.insert(doc, function (err, body, header) { // This one only inserts one document
      if (err) {
        console.log('[fedEx.insert error] ', err);
        res.send("error: ", err);
      }
      if (!err) {
        console.log(body.trackingNumbers);
        res.send(body.trackingNumbers);
      }
    });
  }

});