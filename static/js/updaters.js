

function updateSLData(stations){
    // loop and update each element with class sl-item
    $('.sl-item').each(function(i, obj) {
        // Currently only loops through metros.

        tekniskahogskolan = stations[0]
        metro = tekniskahogskolan.Departures.Metros[i]
        if (metro){
            let destination = metro.Destination
            let line = metro.LineNumber
            let displaytime = metro.DisplayTime
            $(obj).find("span.sl-line-number").text(line)
            $(obj).find("span.sl-line-name").text(destination)
            $(obj).find("span.sl-time").text(displaytime)
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
