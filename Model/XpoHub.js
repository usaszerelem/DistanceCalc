'use strict'

const {Address} = require('./Address');
const empty = require('is-empty');

const MaxStreet = 100; 
const MaxState = 20;
const MaxCity = 60; 
const MaxZip = 12;
const StringEmpty = "";

exports.XpoHub = class extends Address{
    // -----------------------------------------------------------------------
    constructor(hubID, street, city, state, zip) {
        super(street, city, state, zip);

        this._HubID = StringEmpty;

        if (empty(hubID) === false) {
            this._HubID = hubID;
        }
    }

    // -----------------------------------------------------------------------
    
    get ToJSonString() {
        return(ConvertToJSonString());
    }

    // -----------------------------------------------------------------------

    get HubID() {
        return this._HubID;
    }
}

// -----------------------------------------------------------------------

function ConvertToJSonString(){
    var retValue = {}

    retValue.HubID = this._HubID;

    if (this._City == StringEmpty) {
        retValue.City = this._City;
    }

    if (this._Street == StringEmpty) {
        retValue.Street = this._Street;
    }

    if (this._UsState == StringEmpty) {
        retValue.UsState = this._UsState;
    }

    if (this._Street == StringEmpty) {
        retValue.Street = this._Street;
    }

    if (this._Zip == StringEmpty) {
        retValue.Zip = this._Zip;
    }

    return(retValue);
}