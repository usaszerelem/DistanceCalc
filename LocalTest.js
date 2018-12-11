const lambdaLocal = require('lambda-local');
 
var jsonPriceCalc = {
    "From": {
        "Street": "16630 SW Oregon Jade Ct.",
        "City": "Beaverton",
        "State": "OR",
        "Zip": 97007
    },

    "To": {
        "Street": "1500 Orange Ave",
        "City": "Coronado",
        "State": "CA",
        "Zip": 92118
    },

    "Cargo": {
        "Pallets": {
            "Type": "ISO-1",
            "Count": 4
        }
    }
}

lambdaLocal.execute({
    event: jsonPriceCalc,
    lambdaPath: '/Users/martin/Documents/Development/DistanceCalc/index.js',
    profilePath: '~/.aws/credentials',
    profileName: 'default',
    timeoutMs: 9999999,
    callback: function(err, data) {
        if (err) {
            console.log(err);
        } else {
            console.log(data);
        }
    }
});
