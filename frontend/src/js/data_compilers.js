const fetch = require('node-fetch')


// ######   HELPER FUNCTIONS   ######

var realMinutesLeft = function (displaytime, latest_updated){
    /*
     Converts `displaytime` to the amount of minutes left based on current time instead of `latest_updated`.
     This value is used when comparing two departures in `compareDepartures`.
     Returns: float: Amount of minutes left until departure according to current time.
    */
    var upd = new Date(latest_updated)
    let minutes_left
    if (displaytime == "Nu"){
        minutes_left = 0
    }
    else if(displaytime == "-"){
        // Hög prioritet men störning i trafiken
        return 0 // real_minutes_left
    }
    else if (displaytime.includes(":")){
        let time = displaytime.split(":")
        let hours = time[0]
        let mins = time[1]
        let depart = new Date(latest_updated)
        depart.setHours(hours)
        depart.setMinutes(mins)

        // departure can't be before latest_updated, this handles edge cases at midnight.
        if ((depart - upd) <= 0){
            // increment day by 1
            depart.setDate(depart.getDate() + 1)
        }
        minutes_left = (depart - upd)/1000/60
    }
    else {
        minutes_left = parseInt(displaytime.split(" ")[0], 10)
    }
    let real_departure = minutes_left*60 + upd/1000 //unix seconds

    let real_minutes_left = (real_departure - Date.now()/1000)/60
    return real_minutes_left // float
};

var compareDepartures = function (a, b){
    //Compares two departures, used for calling sort()
    return a.minutes_left - b.minutes_left
};

var getDisplayTimeText = function (ride){
    if (ride.ExpectedDateTime && ride.minutes_left > 25){
        // return time in HH:MM format
        return new Date(ride.ExpectedDateTime).toLocaleTimeString().substr(0,5)
    }
    else if (ride.DisplayTime == "-"){
        return "Okänt"
    }
    else {
        // Minutes left from now, could do some converting to HH:MM format if it's too long.
        return Math.round(ride.minutes_left) + " min"
    }
};

// ######   Functions that compile the data   ######

var compileRides = function (stations){
    /*
     Returns all rides in stations as a single list of objects with some modified attributes
     such as `minutes_left`, `type` and a proper `DisplayTime`.
    */

    let rides = []
    let types = ["Metros", "Trams", "Buses"]

    stations.forEach(station =>{
        types.forEach(type => {
            if (station.Departures[type]){
                station.Departures[type].forEach(ride => {
                    ride.minutes_left = realMinutesLeft(ride.DisplayTime, station.Departures.LatestUpdate)
                    ride.DisplayTime = getDisplayTimeText(ride)
                    ride.TransportMode = ride.TransportMode.toLowerCase()
                    rides.push(ride)
                })
            }
        })
    })

    // Keys are StopAreaNumbers (identifiers for stations), values are minutes_left required to be shown on screen.
    let thresholds = {10194:5, 60080:5, 6601:5, 0:5, 10036:2}

    // Sort and remove the ones that already departed or are <= 1 min away.
    rides = rides.filter(ride => ride.minutes_left >= thresholds[ride.StopAreaNumber] || ride.DisplayTime == "Okänt")
        .sort(compareDepartures)

    // separate by transport type and slice to first 9 rides
    let metros = rides.filter(ride => ride.TransportMode == "metro").slice(0,9)
    let buses = rides.filter(ride => ride.TransportMode == "bus").slice(0,9)
    let trams = rides.filter(ride => ride.TransportMode == "tram").slice(0,9)

    return {metros, buses, trams}
};

var compileCalendar = function (calendar){
    //Not implemented yet.
    return  {
            events: [
                {date: "Torsdag den 15 mars", name: "Torsdagspub"},
                {date: "Torsdag den 15 mars", name: "Fysikalen"},
                {date: "Torsdag den 15 mars", name: "Torsdagspub"},
                {date: "Torsdag den 15 mars", name: "Fysikalen"},
                {date: "Torsdag den 15 mars", name: "Ett väldigt långt namn på event"},
                {date: "Torsdag den 15 mars", name: "Torsdagspub"},
                {date: "Torsdag den 15 mars", name: "Fysikalen"},
                {date: "Torsdag den 15 mars", name: "Torsdagspub"}
            ]
        }
};

var compileInstagramPosts = function (instagram){
    //Not implemented yet.
    return null
};

var compileFNews = function (fnewsfeed){
    //Not implemented yet.
    return null
};

var compileFacebookPosts = function (facebook){
    //Not implemented yet.
    return null
};

var getData = function(endpoint) {return fetch(endpoint).then(response => response.json())};

var getState = function (){
    // Returns promise of state.
    return Promise.all([
        getData("http://127.0.0.1:5000/sl-data").then(function(resp){
            return {sl:{rides: compileRides(resp)}}}),
        getData("http://127.0.0.1:5000/sektionskalendern").then(function(resp){
            return {calendar: compileCalendar(resp)}})
    ]).then(responses => {
        let state = {
            image: {
                url: "https://source.unsplash.com/random",
                text: ""
            }
        }
        responses.forEach(response => Object.assign(state, response))

        // only show rides of type specified by state.metadata.sl_carousel
        console.log(state)
        return state
    })
}

module.exports = {
    getState,
    getData,
    compileFacebookPosts,
    compileFNews,
    compileInstagramPosts,
    compileCalendar,
    compileRides,
    compareDepartures,
    getDisplayTimeText,
    realMinutesLeft
}
