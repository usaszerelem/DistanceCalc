'use strict'

const empty = require('is-empty');

const MaxStreet = 100; 
const MaxState = 20;
const MaxCity = 60; 
const MaxZip = 12;
const StringEmpty = "";

exports.Address = class {
    // -----------------------------------------------------------------------

    constructor(street, city, state, zip) {
        this._Street = StringEmpty;
        this._City = StringEmpty;
        this._State = StringEmpty;
        this._Zip = StringEmpty;
        // this._Distance = 0;

        if (empty(street) === false) {
            this._Street = street;
        }

        if (empty(city) === false) {
            this._City = city;
        }

        if (empty(state) === false) {
            this._State = state;
        }

        if (empty(zip) === false) {
            this._Zip = zip;
        }
    }

    // -----------------------------------------------------------------------
    
    get ToJSonString() {
        return(ConvertToJSonString());
    }

    // -----------------------------------------------------------------------
    
    get Street() {
        return this._Street;
    }

    get City() {
        return this._City;
    }

    get State() {
        return this._State;
    }

    get Zip() {
        return this._Zip;
    }
/*
    get Distance() {
        return this._Distance;
    }
*/
    // -----------------------------------------------------------------------
    
    set Street(value) {
        if (value.length > MaxStreet) {
            throw('Street field max size is ' + MaxStreet + ' characters.');
        }

        if (value === undefined || value.length == 0) {
            this._Street = StringEmpty;
        } else {
            this._Street = value;
        }
    }

    // -----------------------------------------------------------------------
    
    set City(value) {
        if (value.length > MaxCity) {
            throw('City field max size is ' + MaxCity + ' characters.');
        }

        if (value === undefined || value.length == 0) {
            this._City = StringEmpty;
        } else {
            this._City = value;
        }
    }

    // -----------------------------------------------------------------------
    
    set State(value) {
        if (value.length > MaxState) {
            throw('State field max size is ' + MaxState + ' characters.');
        }

        if (value === undefined || value.length == 0) {
            this._State = StringEmpty;
        } else {
            this._State = value;
        }
    }

    // -----------------------------------------------------------------------
    
    set Zip(value) {
        if (value.length > MaxZip) {
            throw('Zip field max size is ' + MaxZip + ' characters.');
        }

        if (value === undefined || value.length == 0) {
            this._Zip = StringEmpty;
        } else {
            this._Zip = value;
        }
    }

    // -----------------------------------------------------------------------
/*
    set Distance(value) {
        this._Distance = value;
    }
*/
}

// -----------------------------------------------------------------------

function ConvertToJSonString(){
    var retValue = {}

    if (this._City == StringEmpty) {
        retValue.City = this._City;
    }

    if (this._Street == StringEmpty) {
        retValue.Street = this._Street;
    }

    if (this._State == StringEmpty) {
        retValue.State = this._State;
    }

    if (this._Street == StringEmpty) {
        retValue.Street = this._Street;
    }

    if (this._Zip == StringEmpty) {
        retValue.Zip = this._Zip;
    }

    return(retValue);
}