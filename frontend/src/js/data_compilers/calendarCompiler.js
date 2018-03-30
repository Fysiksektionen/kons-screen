// Module containing functions which compile the calendar data fetched.

var getDate = (event) => {
    let date
    if (event.start.dateTime)
        date = event.start.dateTime
    else if (event.start.date)
        date =  event.start.date
    else 
        date =  0
    return new Date(date).toLocaleString()
}

var remapperFactory = function (dateGetter){
    return event => {
        return {
            date: dateGetter(event),
            location: event.location,
            name: event.summary 
        }
    }
}

var remapEvent = remapperFactory(getDate)

var compileCalendarFactory = function (remapper){
    return calendar => {
        let events = calendar.map(remapper)
        return {calendar: {events}}
    }
};

var compileCalendar = compileCalendarFactory(remapEvent)

module.exports = {
    compileCalendar,
    compileCalendarFactory,

    getDate,
    remapEvent,
    remapperFactory
}