
// ######   HELPER FUNCTIONS   ######

function realMinutesLeft(displaytime, latest_updated){
    /* 
     Converts `displaytime` to the amount of minutes left based on current time instead of `latest_updated`.
     This value is used when comparing two departures in `compareDepartures`.
    */
    var upd = new Date(latest_updated)

    if (displaytime == "Nu"){
        var minutes_left = 0
    }
    else if(displaytime == "-"){
        // Hög prioritet men störning i trafiken
        return 0 // real_minutes_left
    }
    else if (displaytime.includes(":")){
        [hours, mins] = displaytime.split(":")
        let depart = new Date(latest_updated)
        depart.setHours(hours)
        depart.setMinutes(mins)
        
        // departure can't be before latest_updated, this handles edge cases at midnight.
        if ((depart - upd) <= 0){
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

function compareDepartures(a, b){
    //Compares two departures, used for calling sort()
    return a.minutes_left - b.minutes_left
}

function getDisplayTimeText(ride){
    if (ride.ExpectedDateTime){
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
}

// ######   Functions that compile the data   ######

function compileRides(stations){
    /*
     Returns all rides in stations as a single list of objects with some modified attributes
     such as `minutes_left`, `type` and a proper `DisplayTime`.
    */

    rides = []
    types = ["Metros", "Trams", "Buses"]

    stations.forEach(station =>{
        types.forEach(type => {
            if (station.Departures[type]){
                station.Departures[type].forEach(ride => {
                    ride.minutes_left = realMinutesLeft(ride.DisplayTime, station.Departures.LatestUpdate)
                    ride.DisplayTime = getDisplayTimeText(ride)
                    ride.type = type
                    rides.push(ride)
                })
            }
        })
    })
    
    // Sort and remove the ones that already departed or are <= 1 min away.
    rides = rides.sort(compareDepartures).
        filter(ride => ride.minutes_left > 1 || ride.DisplayTime == "Okänt")
    return rides
};

function compileCalendar(calendar){
    //Not implemented yet.
    return  {
            events: [
                {date: moment(testDate.getTime()).calendar(), name: "Torsdagspub"},
                {date: moment(testDate.getTime() + 84000000 * 1).calendar(), name: "Fysikalen"},
                {date: moment(testDate.getTime() + 84000000 * 2).calendar(), name: "Torsdagspub"},
                {date: moment(testDate.getTime() + 84000000 * 4).calendar(), name: "Fysikalen"},
                {date: moment(testDate.getTime() + 84000000 * 6).calendar(), name: "Ett väldigt långt namn på event"},
                {date: moment(testDate.getTime() + 84000000 * 8).calendar(), name: "Torsdagspub"},
                {date: moment(testDate.getTime() + 84000000 * 10).calendar(), name: "Fysikalen"},
                {date: moment(testDate.getTime() + 84000000 * 12).calendar(), name: "Torsdagspub"}
            ]
        }
};

function compileInstagramPosts(instagram){
    //Not implemented yet.
    return null
};

function compileFNews(fnewsfeed){   
    //Not implemented yet.
    return null
};

function compileFacebookPosts(facebook){
    //Not implemented yet.
    return null
};

function getData(endpoint, datatype="json"){
    // return promise which resolves to response data from `endpoint`.
    return new Promise((resolve, reject) => {
        $.get(endpoint, null, null, datatype).done(response => resolve(response))
    })
}

function getState(){
    // Returns promise of state.
    return Promise.all([
        getData("http://127.0.0.1:5000/sl-data").then(function(resp){
            return {sl:{rides: compileRides(resp)}}}),
        getData("http://127.0.0.1:5000/sektionskalendern").then(function(resp){
            return {calendar: compileCalendar(resp)}})
    ]).then(responses => {
        let state = {
            event: false,
            time: moment().format("HH:mm"),
            date: moment().format("dddd D MMMM YYYY"),
            image: {
                url: "https://source.unsplash.com/random",
                text: ""
            }
        }
        responses.forEach(response => $.extend(state, response))
        console.log("state:",state)
        return state
    })
}
