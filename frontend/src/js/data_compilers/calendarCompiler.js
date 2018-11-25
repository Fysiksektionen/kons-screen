// Module containing functions which compile the calendar data fetched.

const moment = require('moment-timezone')
require('moment/locale/sv')
moment.locale('sv')

var getDateFactory = function(deps){
    return event => {
        let date
        if (event.start) {
            if (event.start.dateTime){
                date = event.start.dateTime
                return deps.moment(date).tz('Europe/Stockholm').format('dddd D MMMM HH:mm')
            }
            else if (event.start.date){
                date =  event.start.date
                return deps.moment(date).tz('Europe/Stockholm').format('dddd D MMMM')
            }
        }    
        return 0
    }
}

var getDate = getDateFactory({moment})

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
    getDateFactory,
    
    remapEvent,
    remapperFactory
}