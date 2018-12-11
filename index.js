'use strict';

const request = require('request');
const assert = require('assert');
const KString = require('./Src/KString');
const {Address} = require('./Model/Address');
const {XpoHub} = require('./Model/XpoHub');
const AWS = require("aws-sdk");
const DbClient = new AWS.DynamoDB.DocumentClient();

// ---------------------------------------------------------------------------

var RouteDestinations = undefined;
var FromXpoHubs = undefined;
var ToXpoHubs = undefined;
var cbReturn;

// ---------------------------------------------------------------------------

exports.handler = function(event, context, callback) {
    console.log('Received event:', JSON.stringify(event, null, 2));

    try {
        assert(cbReturn == undefined);
        cbReturn = callback;
        ValidateParams(event);
        FindNearbyHubs(RouteDestinations[0], FoundNearbyFromHubs);
    } catch(err) {
        callback("400 " + err);
    }
};

// ---------------------------------------------------------------------------

function ValidateParams(event) {
    if (!event.hasOwnProperty('From') ||
        !event.hasOwnProperty('To') ||
        !event.hasOwnProperty('Cargo')) {
        throw ("Invalid JSON object.");
    }

    RouteDestinations = new Array();

    RouteDestinations.push(new Address(event.From.Street, event.From.City, event.From.State, event.From.Zip));
    RouteDestinations.push(new Address(event.To.Street, event.To.City, event.To.State, event.To.Zip));
}

// ---------------------------------------------------------------------------

function FoundNearbyFromHubs(hubsArray){
    FromXpoHubs = hubsArray;
    FindNearbyHubs(RouteDestinations[RouteDestinations.length - 1], FoundNearbyToHubs);
}

// ---------------------------------------------------------------------------

function FoundNearbyToHubs(hubsArray) {
    ToXpoHubs = hubsArray;
    FindNearestXpoHub(RouteDestinations[0], FromXpoHubs, FindNearestToXpoHub);
}

// ---------------------------------------------------------------------------

function FindNearestToXpoHub() {
    FindNearestXpoHub(RouteDestinations[RouteDestinations.length-1], ToXpoHubs, ComputeRoute);
}

// ---------------------------------------------------------------------------

function FindNearbyHubs(NearAddress, callback) {
    let scanRequest = {
        TableName: KString.TableName,
        ExpressionAttributeValues: {
            ':st': NearAddress.State
           },
        KeyConditionExpression: 'UsState = :st',
        FilterExpression: 'UsState = :st'
    };

    DbClient.scan(scanRequest, function(err,data){
        if (err) {
            console.log(err.message);
            throw(err);
        } else if (data.Count == 0) {
            throw("There are no XPO Hubs in " + NearAddress.State);
        } else {
            var hubsArray = new Array();

            for (let idx = 0; idx < data.Count; idx++) {
                let toXpoHub = new XpoHub(
                    data.Items[idx].HubID,
                    data.Items[idx].Street,
                    data.Items[idx].City,
                    data.Items[idx].UsState,
                    data.Items[idx].Zip
                    );

                hubsArray.push(toXpoHub);
            }

            callback(hubsArray);
        }
    });
}

// ---------------------------------------------------------------------------

function ComputeRoute() {
    // https://maps.googleapis.com/maps/api/directions/json?origin=Boston,MA&destination=Concord,MA&waypoints=Charlestown,MA|Lexington,MA&key=YOUR_API_KEY

    let fromUrlParam = EncodeAsHttpParam(RouteDestinations[0]);
    let toUrlParam = EncodeAsHttpParam(RouteDestinations[RouteDestinations.length-1]);
    let waypointParam = "";

    for(let idx = 1; idx < (RouteDestinations.length-1); idx++) {
        if (waypointParam.length > 0) {
            waypointParam += '|';
        }

        waypointParam += EncodeAsHttpParam(RouteDestinations[idx]);
    }

    let strUrl = KString.GoogleMapsWaypointsUrl;
    strUrl = strUrl.replace('{{From}}', fromUrlParam);
    strUrl = strUrl.replace('{{To}}', toUrlParam);
    strUrl = strUrl.replace('{{Waypoints}}', waypointParam);

    console.log(strUrl);
    
    request(strUrl, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body);

        if (error) {
            throw(error);
        } else if (response.statusCode != 200) {
            throw("Unexpected Google Maps response: " + response.statusCode);
        } else {
            let data = JSON.parse(body);

            let RetVal = {}
            RetVal.TotalDistanceMeters = 0;

            for (let idx = 0; idx < data.destination_addresses.length; idx++) {
                RetVal.TotalDistanceMeters += data.rows[0].elements[idx].distance.value;
            }

            RetVal.PricePerKm = 1.25;
            RetVal.EstimatedPrice = ((RetVal.TotalDistanceMeters / 1000) * RetVal.PricePerKm).toFixed(2);
            RetVal.Route = RouteDestinations;
        
            cbReturn(null, JSON.stringify(RetVal, null, 2));        
        }
    });
}

// ---------------------------------------------------------------------------

function FindNearestXpoHub(address, addrArray, cbNext) {

    let fromUrlParam = EncodeAsHttpParam(address);
    let toUrlParam = "";

    for (let idx = 0; idx < addrArray.length; idx++) {
        if (toUrlParam.length > 0) {
            toUrlParam += '|';
        }

        toUrlParam += EncodeAsHttpParam(addrArray[idx]);
    }

    let strUrl = KString.GoogleMapsUrl;
    strUrl = strUrl.replace('{{From}}', fromUrlParam);
    strUrl = strUrl.replace('{{To}}', toUrlParam);

    request(strUrl, function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body);

        if (error) {
            throw(error);
        } else if (response.statusCode != 200) {
            throw("Unexpected Google Maps response: " + response.statusCode);
        } else {
            let data = JSON.parse(body);
            let distanceMeters = 99999;
            let nearestIdx = -1;

            for (let idx = 0; idx < data.destination_addresses.length; idx++) {

                let distance = data.rows[0].elements[idx].distance.value;

                if (distance < distanceMeters) {
                    distanceMeters = distance;
                    nearestIdx = idx;
                }
            }

            assert(nearestIdx != -1);
            //addrArray[nearestIdx].Distance = distanceMeters;
            RouteDestinations.splice(RouteDestinations.length-1, 0, addrArray[nearestIdx]);
            cbNext();
        }
    });
}

// ---------------------------------------------------------------------------

function EncodeAsHttpParam(Address) {
    let httpStr = Address.Street;

    httpStr += '+';
    httpStr += Address.City;

    httpStr += '+';
    httpStr += Address.State;

    httpStr += '+';
    httpStr += Address.Zip;

    return(httpStr.replace(/ /g, '+'));
}
