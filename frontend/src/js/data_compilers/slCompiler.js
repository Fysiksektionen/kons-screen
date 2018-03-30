// Module containing functions which compile the SL data fetched.

// ######   HELPER FUNCTIONS   ######

var realMinutesLeft = function (displaytime, latest_updated, now){
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
    const upd = new Date(latest_updated)
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
    const real_departure = minutes_left*60 + upd/1000 //unix seconds
    const real_minutes_left = (real_departure - now/1000)/60
    return real_minutes_left // float
};

var compareDepartures = function (a, b){
    /*Compares two departures, used for calling sort()
      Params `a` and `b`: An object representing a ride.
      Returns: The difference in the amount of minutes left.
               Negative if b departs later than a.
    */
    return a.minutes_left - b.minutes_left
};

var getDisplayTimeText = function (ride){
    /*Returns the departure time string which is to be displayed on screen for a ride.

      Param ride: An object representing a `ride`.
      Returns: A string representing the departure time of the given `ride`
    */
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

// ######   Functions that compile the rides   ######

var compileRidesFactory = function(deps) {
    /*A function which generates a compileRide function given its dependencies.

      This exists in order to test compileRides but without its real dependencies.
      When testing you pass mock ("fake") functions that you can control in order
      to inspect how they were handled and behaved in retrospect.
      
      Param deps: An object containing the dependencies of the function.
        {
            extractor,
            remapper,
            filterer,
            sorter,
            separator
        }
      Returns: A function which takes an array `stations` and returns an array of
               all filtered and sorted rides in all `stations`.
    */
    return stations => {
        // First extract the rides from all stations and modify the ride objects
        // to have certain desired properties.
        let rides = deps.extractor(stations, deps.remapper)
        // Then filter the rides removing any rides that shouldn't be shown
        // then sort the rides by minutes left in ascending order.
        rides = rides.filter(deps.filterer).sort(deps.sorter)
        // Then separate the rides into their respective transport mode.
        // `rides` is now an object with the transport modes as keys.
        rides = deps.separator(rides)
        // return an object {sl:{metros:[MetrosArray],buses:[BusesArray],trams:[TramsArray]}}
        return {sl:{rides}}
    }
}

var extractRides = function(stations, remapper) {
    /* This function is the first one called in compileRides in order
       to extract all of the rides from all stations into a single array.
    Params:
        stations: Array of objects representing a station.
        remapper: Function which is called on each ride in a station,
                  it should return a modified ride.
    Returns: A single array of all combined rides in stations.
    */
   let rides = []
   const types = ["Metros", "Trams", "Buses"]
   
   const now = new Date()
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

var remapRideFactory = deps => function (ride, station, now){
    /* 
    This exists in order to test remapRide but without its real dependencies.
    When testing you pass mock ("fake") functions that you can control in order
    to inspect how they were handled and behaved in retrospect.
    
    Param: An object containing the dependencies of the function.
    {
        realMinutesLeftGetter,
        displayTimeTextGetter
    }
    Returns: A function which takes param `ride`, an object representing a ride,
             and returns a ride with updated properties.
    */
   let newride = Object.assign({}, ride) // don't modify ride, instead return new ride.
   newride.minutes_left = deps.realMinutesLeftGetter(
       newride.DisplayTime, station.Departures.LatestUpdate, now
    )
    newride.DisplayTime = deps.displayTimeTextGetter(newride)
    newride.TransportMode = newride.TransportMode.toLowerCase()
    newride.SiteId = station.SiteId
    return newride
}

var remapRide = remapRideFactory({
    /*Function that returns a modified ride object
      Params:
        ride: An object representing a ride.
        station: An object representing a station.
        now: Date object representing the current datetime.
      Returns: A modified copy of parameter `ride`.
    */
    realMinutesLeftGetter: realMinutesLeft,
    displayTimeTextGetter: getDisplayTimeText
})

var rideFilterer = function(thresholds){
    /*A function which returns a filter function to be used in Array.filter

    Param: 
         thresholds:  An object with keys `SiteId` (identifiers for stations),
                      values are `minutes_left` required to be shown on screen.
         Example: SiteId 1337 for Tekniska högskolan and 6 min left required
                  for a ride to be shown on screen:
                        thresholds = {1337:6}
    Returns: A function which returns false if ride should be filtered.
    */
   
   // Sort and remove the ones that are above the specified thresholds.
   return ride => ride.minutes_left >= thresholds[ride.SiteId] || ride.DisplayTime == "Okänt"
}

var separateByType = function(rides){
    /*Separates by transport type and slices to first 9 rides.
      Param `rides`: Array of objects representing a ride.
      Returns: Object containing keys metros, buses and trams each containing
               an array of rides of the corresponding transport mode.
    */
   const metros = rides.filter(ride => ride.TransportMode == "metro").slice(0,9)
   const buses = rides.filter(ride => ride.TransportMode == "bus").slice(0,9)
   const trams = rides.filter(ride => ride.TransportMode == "tram").slice(0,9)
   return {metros, buses, trams}
}

var compileRides = compileRidesFactory({
    extractor: extractRides,
    // 1118 is Ruddammsparken and 9204 is Tekniska Högskolan
    // Noted by yashar: Should we separate this param to a configuration file of some sort?
    filterer: rideFilterer({1118:2, 9204:5}), 
    separator: separateByType,
    sorter: compareDepartures,
    remapper: remapRide
});

module.exports = {
    compileRides,
    compileRidesFactory,

    realMinutesLeft,
    getDisplayTimeText,
    compareDepartures,

    extractRides,
    remapRideFactory,
    remapRide,
    rideFilterer,
    separateByType
}