
const getStateFactory = require('./getState').getStateFactory

let deps
let getState

beforeEach(() => {
    deps = {
        sl: {}, cal: {}, fb: {}, ig: {}, fnews: {}
    }
    // inject getState with fake dependencies
    getState = getStateFactory(deps)
});

it('correctly calls dependencies and appended results to state', () => {
    const fakeFetchFactory = expectedEndpoint => endpoint => {
        // function which generates a fakeFetch, the fakeFetch 
        // should expect to be called with the expectedEndpoint
        expect(endpoint).toBe(expectedEndpoint)
        return Promise.resolve({data:"notmodified"})
    }
    const fakeCompiler = caller => resp => {
        expect(resp.data).toBe("notmodified")
        let parsed = {}
        parsed[caller] = "modified"
        // return {`caller`:"modified"} with `caller` replaced with the string.
        return parsed
    }
    const base = "http://127.0.0.1:5000/"
    deps.sl.fetcher = fakeFetchFactory(base + "sl-data")
    deps.cal.fetcher = fakeFetchFactory(base + "sektionskalendern")
    deps.sl.compiler = fakeCompiler("sl")
    deps.cal.compiler = fakeCompiler("cal")
    // verify that each compiler was called (and result added to state)
    return getState().then(state => expect(state).toEqual({
            sl:"modified",
            cal:"modified"
        })
    )
});
