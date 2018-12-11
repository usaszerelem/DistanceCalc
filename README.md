This is a simple proof of concept work done to calculate driving distance
between a source and a destination address for shipping containers via
distribution hubs. The NodeJS service was tested on AWS and uses a
Dynamo DB database to find the nearest distribution hub to the source
location, and the nearest distribution hub to the destination location.

The service uses Google Maps APIs to calculate the shortest distance
to the various distribution centers, and solely for this proof of
concept it applies a $1.25 charge per Kilometer for one pallet.

The service is requested to be called with the following JSON object:

{
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

For this initial version the 'Cargo' node is ignored, but this can
easily be implemented for different cargo types.

The return JSON object contains the total distance in meters, price per
kilometer, estimated price and the calculated route including waypoints.

{
  "TotalDistanceMeters": 1747311,
  "PricePerKm": 1.25,
  "EstimatedPrice": "2184.14",
  "Route": [
    {
      "_Street": "16630 SW Oregon Jade Ct.",
      "_City": "Beaverton",
      "_State": "OR",
      "_Zip": 97007
    },
    {
      "_Street": "12250 SE Ford Street",
      "_City": "Clackamas",
      "_State": "OR",
      "_Zip": "97015",
      "_HubID": "LTL-Portland"
    },
    {
      "_Street": "4965 Convoy St",
      "_City": "San Diego",
      "_State": "CA",
      "_Zip": "92111",
      "_HubID": "LTL-San Diego"
    },
    {
      "_Street": "1500 Orange Ave",
      "_City": "Coronado",
      "_State": "CA",
      "_Zip": 92118
    }
  ]
}