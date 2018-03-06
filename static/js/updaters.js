
// Converts `displaytime` to the amount of minutes left based on current time instead of `latest_updated`.
function realDisplaytime(displaytime, latest_updated){
    let latest_updated_unix = Date.parse(latest_updated)
    if (displaytime == "Nu"){
        displaytime = "0 min"
    }
    let real_departure = displaytime.split(" min")[0]*60 + latest_updated_unix/1000

    let minutes_left = (real_departure - Date.now()/1000)/60
    return minutes_left // float
}

//Compares two departures, used for calling sort()
function compareDepartures(a, b){
    a_min_left = a.DisplayTime.split(" min")[0]
    b_min_left = b.DisplayTime.split(" min")[0]
    
    a_min_left = a_min_left == "Nu" ? "0" : a_min_left
    b_min_left = b_min_left == "Nu" ? "0" : b_min_left

    return a_min_left - b_min_left
}

function updateSLData(stations){
    // loop and update each element with class sl-item
    var tekniskahogskolan = stations[0]
    var metros = tekniskahogskolan.Departures.Metros
    var latest_updated = tekniskahogskolan.Departures.LatestUpdate

    // Sort and remove the ones that already departed or are <= 1 min away.
    metros = metros.sort(compareDepartures).
        filter(metro => realDisplaytime(metro.DisplayTime, latest_updated) > 1)

    $('.sl-item').each(function(i, obj) {
        // Currently only loops through metros.
        // Also only loops through a single station.
        metro = metros[i]
        
        should_show = true
        if (metro){
            var displaytime = metro.DisplayTime
            
            // Just to be safe
            if (displaytime != "Nu"){
                // Extrapolate the real departure time from the data (which is old).
                var minutes_left = realDisplaytime(displaytime, tekniskahogskolan.Departures.LatestUpdate)
                var real_displaytime = Math.round(minutes_left) + " min"
                
                // Only show departures which are yet to depart.
                $(obj).find("span.sl-line-number").text(metro.LineNumber)
                $(obj).find("span.sl-line-name").text(metro.Destination)
                $(obj).find("span.sl-time").text(real_displaytime)
            }
            else{should_show = false}

        }
        else{should_show = false}
        if (!should_show) {
            // Remove the old residual data.
            $(obj).find("span.sl-line-number").text("")
            $(obj).find("span.sl-line-name").text("")
            $(obj).find("span.sl-time").text("")
        }
    });
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
