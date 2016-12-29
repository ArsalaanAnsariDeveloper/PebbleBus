/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */
var UI = require('ui');
var ajax = require("ajax");

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

//get position using phone gps
var lat, lon;
function locationSuccess(pos) {
  lat = pos.coords.latitude;
  lon = pos.coords.longitude;
}

function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}
navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);

//temporary Seattle lat & lon to avoid MTA key issue and VPN
lat = 47.6557000;
lon = -122.3120000;
console.log("lat:" + lat + ", lon:" + lon);

// Make an asynchronous request
ajax(
  {
    url:'http://api.pugetsound.onebusaway.org/api/where/stops-for-location.json?key=TEST&lat='+lat+'&lon='+lon,
    type:'json'
  },
  function(jsonData) {
    var list = jsonData.data.list;
    console.log(list);
    var listNames = [];
    for (var i = 0; i < list.length; i++) { 
      listNames[i] = { 
        title: "Stop " + (i+1),
        subtitle: list[i].name
      };
    }
    var stopsMenu = new UI.Menu({
      sections: [{
        title: 'Stops List:',
        items: listNames
      }]
    });
    stopsMenu.show();
    
    stopsMenu.on('select', function(e) {
      var index = e.itemIndex;
      var stop = list[index];
      var card = new UI.Card({
        title: stop.name,
        subtitle: "Minutes away: " + getStopInfo(stop.id) + " mins"
      });
      card.show();
      });
  },
  function(error) {
    console.log('Location download failed: ' + error);
  }
);

function getStopInfo(stopID) {
  var estArrivalTime = 0;
  ajax(
  {
    url:'http://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/'+stopID+'.json?key=TEST',
    type:'json'
  },
  function(jsonData) {
    var schedule = jsonData.data.entry.arrivalsAndDepartures[0];
    estArrivalTime = schedule.scheduledArrivalTime;
  },
  function(error) {
    console.log('Stop Info Download Failed: ' + error);
  }); 
  var currentTime = Date.now();
  estArrivalTime = currentTime + (Math.random() * (15*60*1000)) + 60000;
  return Math.round((estArrivalTime - currentTime)/60000);
}
