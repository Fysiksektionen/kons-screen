const fetch = require('node-fetch')

const compileRides = require('./slCompiler').compileRides
const compileCalendar = require('./calendarCompiler').compileCalendar
const compileInstagram = () => null
const compileFacebook = () => null
const compileFNews = () => null


var toJson = resp => resp.json()

var fetcher = function(endpoint, intermediary = toJson) {
    // Fetch from endpoint and then call intermediary with the response object.
    // Returns: A promise of the response data as a javascript object.
    return fetch(endpoint).then(intermediary)
};

var getStateFactory = function (deps){
    /*A function generating getState functions based on what compilers you provide
      as dependencies.

      This exists in order to test getState but without its real dependencies.
      When testing you pass mock ("fake") functions that you can control in order
      to inspect how they were handled and behaved in retrospect.

    // Returns: A getState function based on dependencies specified by `deps`.
    //          the returned function returns a promise which resolves to the 
                state used in the react application.
    */
    return () => {
        return Promise.all([
            // Fetch data from localhost which in turn calls f.kth.se
            // and then call the relevant compiler with the data returned.
            deps.sl.fetcher("http://127.0.0.1:5000/sl-data").then(
                deps.sl.compiler),
            deps.cal.fetcher("http://127.0.0.1:5000/sektionskalendern").then(
                deps.cal.compiler)
        ]).then(responses => {
            let state = {}
            // Append each result to the state.
            responses.forEach(response => Object.assign(state, response))
            return state
        })
    }
}

var getState = getStateFactory({
    sl:{fetcher:fetcher, compiler: compileRides},
    cal:{fetcher:fetcher, compiler: compileCalendar},
    fb:{fetcher:fetcher, compiler: compileFacebook},
    ig:{fetcher:fetcher, compiler: compileInstagram},
    // TODO: fnews should fetch with an intermediary which parses XML to an object
    fnews:{fetcher:fetcher, compiler: compileFNews} 
})

module.exports = {
    getState,
    getStateFactory
}