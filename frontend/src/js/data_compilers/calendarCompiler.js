// Module containing functions which compile the calendar data fetched.

var compileCalendar = function (calendar){
    var getDate = (e) => {
        if (e.start.dateTime)
            return e.start.dateTime
        else if (e.start.date)
            return e.start.date
        else 
            return 0
    }

    var events = calendar
        .map( (e) => {
            return {
                date: (new Date(getDate(e))).toLocaleString(),
                location: e.location,
                name: e.summary }
            })
    return {calendar: {events}}
};

module.exports = {
    compileCalendar
}