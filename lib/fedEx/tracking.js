var async = require('async');
var fedexAPI = require('shipping-fedex');

exports = module.exports = function () { };

exports.track = function (trackingNumbers, callback) {

    var trackingObjects = [];

    for (var i = 0; i < trackingNumbers.length; i++) {
        var fedExOptions = {
            SelectionDetails: {
                PackageIdentifier: {
                    Type: 'TRACKING_NUMBER_OR_DOORTAG',
                    Value: trackingNumbers[i] //// change this part
                }
            }
        }
        trackingObjects.push(fedExOptions);
    }

    async.map(trackingObjects, track, function (err, results) {
        if (err) {
            callback('error: ', err);
        }
        if (!err) {
            callback(results);
        }
    });
}

function track(fedExOptions, callback) {

    var fedex = new fedexAPI({
        environment: 'sandbox', // or live
        debug: true,
        key: 'm6V9MCeAJClXOJ0t',
        password: '5U1RdXE7rvlo5tMeBb6vQb49S',
        account_number: '510087186',
        meter_number: '118754438',
        imperial: true // set to false for metric
    });

    var exportObject = {};

    fedex.track(fedExOptions, function (err, result) {
        if (err) {
            callback(err, null);
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

            console.log(result);
            callback(null, exportObject);
        }
    });
}