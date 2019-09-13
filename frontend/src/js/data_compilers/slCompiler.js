// Module containing functions which compile the SL data fetched.

const moment = require('moment-timezone')
require('moment/locale/sv')
moment.locale('sv')

// ######   HELPER FUNCTIONS   ######

/*
 Converts `displaytime` to the amount of minutes left based on current time instead of `latest_updated`.
 This value is used when comparing two departures in `compareDepartures`.
 Params:
    displaytime: String representing the display time,
                 formats are 'HH:MM', 'x min' and just '-'
    latest_updated: Datetime string representing the latest time the data was updated.
                    format : "YYYY-MM-DDThh:mm:ss"
    now: Date object representing the current datetime.
 Returns (float): Amount of minutes left until departure according to current time.
*/
const realMinutesLeft = function (displaytime, latest_updated, now){
    const upd = moment.tz(latest_updated, 'Europe/Stockholm')
    let minutes_left
    if (displaytime == "Nu"){
        minutes_left = 0
    }
    else if(displaytime == "-"){
        // Hög prioritet men störning i trafiken
        return 0 // real_minutes_left
    }
    else if (displaytime.includes(":")){
        const time = displaytime.split(":")
        const hours = time[0]
        const mins = time[1]
        let depart = moment.tz(latest_updated,'Europe/Stockholm')
        depart.hour(hours)
        depart.minute(mins)

        // departure can't be before latest_updated, this handles edge cases at midnight.
        if ((depart - upd) <= 0){
            // increment day by 1
            depart.add(1, 'days')
        }
        minutes_left = (depart - upd)/1000/60
    }
    else {
        minutes_left = parseInt(displaytime.split(" ")[0], 10)
    }
    const real_departure = minutes_left*60 + upd/1000 //unix seconds
    const real_minutes_left = (real_departure - now/1000)/60
    return real_minutes_left // float
};

/*Compares two departures, used for calling sort()
  Params `a` and `b`: An object representing a ride.
  Returns: The difference in the amount of minutes left.
           Negative if b departs later than a.
*/
const compareDepartures = function (a, b){
    return a.minutes_left - b.minutes_left
};

/*Returns the departure time string which is to be displayed on screen for a ride.
   Param ride: An object representing a `ride`.
   Returns: A string representing the departure time of the given `ride`
*/
const getDisplayTimeText = function (ride){
   if (ride.ExpectedDateTime && ride.minutes_left > 25){
       // return time in HH:MM format
        return moment.tz(ride.ExpectedDateTime,'Europe/Stockholm').format('HH:mm')
    }
    else if (ride.DisplayTime == "-"){
        return "Okänt"
    }
    else {
        // Minutes left from now, could do some converting to HH:MM format if it's too long.
        return Math.round(ride.minutes_left) + " min"
    }
};

// ######   Functions that compile the rides   ######

/* 
    This exists in order to test remapRide but without its real dependencies.
    When testing you pass mock ("fake") functions that you can control in order
    to inspect how they were handled and behaved in retrospect.
    
    Param remapper: A function which returns a new ride given a ride object.
    Returns: A function to extract all of the rides from all stations into a single array.
*/
const extractRidesFactory = (remapper) => function(stations) {
   let rides = []
   const types = ["Metros", "Trams", "Buses"]
   
   const now = moment().tz('Europe/Stockholm')
   stations.forEach(station => {
       types.forEach(type => {
           if (station.Departures[type]){
               station.Departures[type].forEach(ride => {
                   const newride = remapper(ride, station, now)
                   rides.push(newride)
                })
            }
        })
    })
    return rides
}

// This exists in order to test remapRide but without its real dependencies.
// When testing you pass mock ("fake") functions that you can control in order
// to inspect how they were handled and behaved in retrospect.
/* 
Param: An object containing the dependencies of the function.
{
    realMinutesLeftGetter,
    displayTimeTextGetter
}
Returns: A function which takes param `ride`, an object representing a ride,
         and returns a ride with updated properties.
*/
const remapRideFactory = deps => function (ride, station, now){
   let newride = Object.assign({}, ride) // don't modify ride, instead return new ride.
   newride.minutes_left = deps.realMinutesLeftGetter(
       newride.DisplayTime, station.Departures.LatestUpdate, now
    )
    newride.DisplayTime = deps.displayTimeTextGetter(newride)
    newride.TransportMode = newride.TransportMode.toLowerCase()
    newride.SiteId = station.SiteId
    return newride
}

/*Function that returns a modified ride object
  Params:
    ride: An object representing a ride.
    station: An object representing a station.
    now: Date object representing the current datetime.
  Returns: A modified copy of parameter `ride`.
*/
const remapRide = remapRideFactory({
    realMinutesLeftGetter: realMinutesLeft,
    displayTimeTextGetter: getDisplayTimeText
})


const extractRides = extractRidesFactory(remapRide)

/*A function which returns a filter function to be used in Array.filter

Param: 
     thresholds:  An object with keys `SiteId` (identifiers for stations),
                  values are `minutes_left` required to be shown on screen.
     Example: SiteId 1337 for Tekniska högskolan and 6 min left required
              for a ride to be shown on screen:
                    thresholds = {1337:6}
Returns: A function which returns false if ride should be filtered.
*/
const rideFilterer = function(thresholds){
   
   // Sort and remove the ones that are above the specified thresholds.
   return ride => ride.minutes_left >= thresholds[ride.SiteId] || ride.DisplayTime == "Okänt"
}

/*Separates by transport type and slices to first 9 rides.
  Param `rides`: Array of objects representing a ride.
  Returns: Object containing keys metros, buses and trams each containing
           an array of rides of the corresponding transport mode.
*/
const separateByType = function(rides){
   const metros = rides.filter(ride => ride.TransportMode == "metro").slice(0,9)
   const buses = rides.filter(ride => ride.TransportMode == "bus").slice(0,9)
   const trams = rides.filter(ride => ride.TransportMode == "tram").slice(0,9)
   return {sl:{rides:{metros, buses, trams}}}
}

// chain call each function in functions, e.g:  f1(f2(f3(x))), only used below in compileRides.
const pipe = (...functions) => x => functions.reduce((y, f) => f(y), x)

// A function which takes an array `stations` and returns an array of
// all filtered and sorted rides in all `stations`
// 1118 is Ruddammsparken and 9204 is Tekniska Högskolan
const compileRides = pipe(extractRides,
                        rides => rides.filter(rideFilterer({1118:2, 9204:5})),
                        rides => rides.sort(compareDepartures),
                        separateByType)

module.exports = {
    compileRides,

    realMinutesLeft,
    getDisplayTimeText,
    compareDepartures,

    extractRides,
    extractRidesFactory,
    remapRideFactory,
    remapRide,
    rideFilterer,
    separateByType
}