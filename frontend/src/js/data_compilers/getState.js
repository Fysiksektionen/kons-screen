const fetch = require('node-fetch')

const compileRides = require('./slCompiler').compileRides
const compileCalendar = require('./calendarCompiler').compileCalendar
const compileInstagram = () => null
const compileFacebook = () => null
const compileFNews = () => null


var getData = function(endpoint) {return fetch(endpoint).then(response => response.json())};

var getState = function (){
    // Returns promise of state.
    return Promise.all([
        getData("http://127.0.0.1:5000/sl-data").then(function(resp){
            return {sl:{rides: compileRides(resp)}}}),
        getData("http://127.0.0.1:5000/sektionskalendern").then(function(resp){
            return {calendar: compileCalendar(resp)}})
    ]).then(responses => {
        let state = {}
        responses.forEach(response => Object.assign(state, response))

        // only show rides of type specified by state.metadata.sl_carousel
        console.log(state)
        return state
    })
}

module.exports = {
    getState
}