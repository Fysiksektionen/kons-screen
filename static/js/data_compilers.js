


// Converts `displaytime` to the amount of minutes left based on current time instead of `latest_updated`.
// This value is used when comparing two departures in `compareDepartures`.
function realMinutesLeft(displaytime, latest_updated){
    var upd = new Date(latest_updated)

    if (displaytime == "Nu"){
        var minutes_left = 0
    }
    else if(displaytime == "-"){
        // Hög prioritet men störning i trafiken
        return 0 // real_minutes_left
    }
    else if displaytime.includes(":"){
        [hours, mins] = displaytime.split(":")
        let depart = new Date(latest_updated)
        depart.setHours(hours)
        depart.setMinutes(mins)
        
        // departure can't be before latest_updated, this handles edge cases at midnight.
        if (depart - upd) <= 0){
            // increment day by 1
            depart.setDate(depart.getDate() + 1)
        }
        var minutes_left = (depart - upd)/1000/60
    }
    else {
        var minutes_left = parseInt(displaytime.split(" ")[0])
    }
    let real_departure = minutes_left*60 + upd/1000 //unix seconds

    let real_minutes_left = (real_departure - Date.now()/1000)/60
    return real_minutes_left // float
}

//Compares two departures, used for calling sort()
function compareDepartures(a, b){
    return a.minutes_left - b.minutes_left
}

function getDisplayTimeText(ride){
    if (ride.ExpectedDateTime){
        // return time in HH:MM format
        return Date(ride.ExpectedDateTime).toLocaleTimeString().substr(0,5)
    }
    else if (ride.DisplayTime == "-"){
        return "Okänt"
    }
    else {
        // Minutes left from now, could do some converting to HH:MM format if it's too long.
        return Math.round(ride.minutes_left) + " min"
    }
}


function compileRides(stations){
    // loop and update each element with class sl-item
    var tekniskahogskolan = stations[0]
    var metros = tekniskahogskolan.Departures.Metros
    var latest_updated = tekniskahogskolan.Departures.LatestUpdate

    // Sort and remove the ones that already departed or are <= 1 min away.
    rides = []
    for station in stations
        for ride in station.Departures
            ride.minutes_left = realMinutesLeft(ride.DisplayTime, station.latest_updated)
            ride.type = 

    departures = departures.sort(compareDepartures).
        filter(ride => realMinutesLeft(ride.DisplayTime, latest_updated) > 1)

    // Currently only loops through metros.
    // Also only loops through a single station.
    stations = {"Ruddammsparken":["Buses"], ["Metros","Trams","Buses"]}
    
    should_show = true
    if (metro){
        var displaytime = metro.DisplayTime
        
        // Just to be safe
        if (displaytime != "Nu"){
            // Extrapolate the real departure time from the data (which is old).
            var minutes_left = realMinutesLeft(displaytime, tekniskahogskolan.Departures.LatestUpdate)
            var real_displaytime = Math.round(minutes_left) + " min"
            
            // Only show departures which are yet to depart.
            $(obj).find("span.sl-line-number").text(metro.LineNumber)
            $(obj).find("span.sl-line-name").text(metro.Destination)
            $(obj).find("span.sl-time").text(real_displaytime)
        }
    }
};

//Not implemented yet.
function updateCalendarEvents(calendar){
    
};

//Not implemented yet.
function updateInstagramPosts(instagram){
    // loop over elements with same class and change with jquery.
};

//Not implemented yet.
function updateFNews(fnewsfeed){   
    // loop over elements with same class and change with jquery. 
};

//Not implemented yet.
function updateFacebookPosts(facebook){
    // loop over elements with same class and change with jquery.
};


function getData(endpoint, callback, datatype="json"){
    // return function which fetches data from `endpoint` and calls `callback` with the response.
    return () => $.get(endpoint, callback, datatype);
}

// Set update intervals of endpoints and bind to callback update functions.
setInterval(getData("http://127.0.0.1:5000/sl-data", updateSLData),                     10000)
//setInterval(getData("http://127.0.0.1:5000/sektionskalendern", updateCalendarEvents),   10000) 
//setInterval(getData("http://127.0.0.1:5000/fnews", updateFNews, "xml"),                 10000)
//setInterval(getData("http://127.0.0.1:5000/facebook", updateFacebookPosts),             10000) 
//setInterval(getData("http://127.0.0.1:5000/instagram", updateInstagramPosts),                                10000) 
