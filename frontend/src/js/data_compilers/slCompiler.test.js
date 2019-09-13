// Test suite for the compilation of the SL data fetched.

const sl_compiler = require('./slCompiler')
const moment = require('moment-timezone')

describe('realMinutesLeft',() => {
    const latest_upd = "2018-03-15T19:42:00"
    let time
    beforeEach(() => {
        time = moment.tz(latest_upd,'Europe/Stockholm')
    });

    it('handles format `x min`', () => {
        time.add(3, 'minutes')
        const result = sl_compiler.realMinutesLeft("10 min", latest_upd, time)
        expect(result).toBe(7)
    });

    it('handles format `hh:mm`', () => {
        const curr_minutes = time.minute()
        time.add(3, 'minutes')
        let depart = moment.tz(latest_upd,'Europe/Stockholm')
        depart.add(43, 'minutes')
        const result = sl_compiler.realMinutesLeft(depart.format('HH:mm'), latest_upd, time)
        expect(result).toBe(40)
    });

    it('handles unknown time `-`)',() => {
        expect(sl_compiler.realMinutesLeft("-", latest_upd, time)).toBe(0)
    });

    it('handles edge case at midnight', () => {
        /* This test previously failed but started working suddenly,
            which might be because I updated my Node to version 9.8.0.
            The error was that it was offset by 1 hour, returning 58 instead of 118.
            http://i.imgur.com/PCWqrYG.gifv
            I note however that it worked if I executed it in the web browser (Chrome) 
            so hopefully there should be no issues related to this as long as node is 
            configured correctly. It was not a daylight savings issue seeing as it hasn't
            started yet here in Europe and had already started in America.
        */
        const time = moment.tz("2018-03-15T22:52:00", 'Europe/Stockholm')
        const result = sl_compiler.realMinutesLeft("00:50", latest_upd, time)
        expect(result).toBe(118)
    });
})

describe('getDisplayTimeText', () => {
    let ride
    beforeEach(() => {
        ride = {}
    });

    it('returns format HH:MM if min left > 25 and ride has expected datetime', () => {
        ride.ExpectedDateTime = "2018-03-15T22:52:00"
        ride.minutes_left = 38.342
        expect(sl_compiler.getDisplayTimeText(ride)).toBe("22:52")
    });
    
    it('returns "Okänt" if displaytime is "-"', () => {
        ride.DisplayTime = "-"
        expect(sl_compiler.getDisplayTimeText(ride)).toBe("Okänt")
    });

    it('returns format "x min" and rounded correctly if less than 25 min left', () => {
        ride.minutes_left = 12.321
        expect(sl_compiler.getDisplayTimeText(ride)).toBe("12 min")
        ride.minutes_left = 12.521
        expect(sl_compiler.getDisplayTimeText(ride)).toBe("13 min")
    });
})

describe('sl_compiler steps', () => {
    describe('extractRides', () => {
        let stations
        let extractRides
        let remapper
        beforeEach(() => {
            remapper = jest.fn().mockImplementation((ride, station, now) => ride)
            extractRides = sl_compiler.extractRidesFactory(remapper)
            stations = [
                {Departures:{Metros:[], Buses:[], Trams:[]}},
                {Departures:{Metros:[], Buses:[], Trams:[]}}
            ]
        });
        it('correctly calls remapper and returns expected data', () => {
            stations[0].Departures.Metros = ["metro1","metro2"]
            stations[0].Departures.Buses = ["bus1","bus2","bus3","bus4"]
            stations[0].Departures.Trams = ["tram1","tram2","tram3"]
            stations[1].Departures.Buses = ["bus42", "bus1337"]

            const expected = ["metro1", "metro2", "tram1", "tram2", "tram3", "bus1",
                                "bus2", "bus3", "bus4", "bus42", "bus1337"]
            const result = extractRides(stations)
            
            expect(result).toMatchObject(expected)

            expect(remapper).toBeCalledWith(
                // remapper doesn't really take strings as argument, this is just to check
                // that the values passed correspond to the expected value.
                expect.any(String), 
                expect.objectContaining({
                    Departures: expect.objectContaining({
                        Metros: expect.any(Array),
                        Trams: expect.any(Array),
                        Buses: expect.any(Array),
                    })
                }),
                expect.any(moment)
            )
        });
        it('handles stations with no rides', () => {
            const result = extractRides(stations)
            expect(result).toEqual([])

        });

    })

    describe('remapRide', () => {
        const emptyfunc = () => null
        let deps
        let remapRide
        beforeEach(()=>{
            deps = {
                realMinutesLeftGetter: emptyfunc,
                displayTimeTextGetter: emptyfunc
            }
            remapRide = sl_compiler.remapRideFactory(deps)
        });

        it('correctly calls dependencies and returns expected properties', () => {
            const fakeMinutesLeft = jest.fn().mockReturnValue(2.432)
            const fakeDisplayTime = jest.fn().mockReturnValue("2 min")
            deps.realMinutesLeftGetter = fakeMinutesLeft
            deps.displayTimeTextGetter = fakeDisplayTime
            
            const ride = {
                DisplayTime:"1337 min", 
                TransportMode:"",
            }
            const station = {
                Departures:{
                    LatestUpdate:"DateTimeString"
                }, 
            }

            const result = remapRide(ride, station, "Date object")
            const expected = {
                minutes_left: 2.432,
                DisplayTime: "2 min",
                TransportMode: "",
                SiteId: undefined
            }
            expect(fakeMinutesLeft).toBeCalledWith("1337 min", "DateTimeString", "Date object")
            expect(fakeDisplayTime).toBeCalledWith(expected)
            expect(result).toEqual(expected)
        });
        
        it('maps `TransportMode` to lowercase', () => {
            const ride = {TransportMode:"ThIs iS dEfiNiTELY LowErCASE"}
            const station = {
                Departures:{}
            }
            expect(remapRide(ride, station, null)).toHaveProperty(
                "TransportMode", "this is definitely lowercase"
            )
        });

        it('returns a ride with new property SiteId from `station`', () => {
            const ride = {TransportMode:""}
            const station = {
                Departures:{},
                SiteId:42
            }
            expect(remapRide(ride, station, null)).toHaveProperty("SiteId", 42)
        });
    })

    describe('filterRides', () => {
        let ride
        const thresholds = {1337:5}
        const filterRide = sl_compiler.rideFilterer(thresholds)
        beforeEach(() => {
            ride = {
                minutes_left: null,
                SiteId: 1337
            }
        });
        
        it('filters ride under threshold', () => {
            ride.minutes_left = 2.432
            expect(filterRide(ride)).toBe(false)
        });
        
        it('does not filter ride above threshold', () => {
            ride.minutes_left = 5.342
            expect(filterRide(ride)).toBe(true)
        });
    });    

    describe('separateByType', () => {
        let rides
        it('ignores irrelevant ride types and returns correct format', () => {
            rides = [
                {TransportMode:"metro"}, {TransportMode:"bus"}, {TransportMode:"train"},
                {TransportMode:"metro"}, {TransportMode:"bus"}, {TransportMode:"tram"}
            ]
            // rides contains 1 ship, this should not be included
            expect(sl_compiler.separateByType(rides)).toEqual({sl:{rides:{
                metros: [{TransportMode:"metro"},{TransportMode:"metro"}],
                buses: [{TransportMode:"bus"},{TransportMode:"bus"}],
                trams: [{TransportMode:"tram"}]}}
            })
        });

        it('slices to length 9', () => {
            rides = [
                {TransportMode:"metro"},{TransportMode:"metro"},
                {TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"},
                {TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"},
                {TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"},
                {TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"},
                {TransportMode:"tram"},
            ]
            expect(sl_compiler.separateByType(rides)).toEqual({sl:{rides:{
                metros: [{TransportMode:"metro"},{TransportMode:"metro"}],
                buses: [{TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"},
                        {TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"},
                        {TransportMode:"bus"},{TransportMode:"bus"},{TransportMode:"bus"}],
                trams: [{TransportMode:"tram"}]}}
            })
        });
    });

    describe('compareDepartures', () => {
        it('sorts in ascending order', () => {
            let fakeRide1 = {minutes_left:3}
            let fakeRide2 = {minutes_left:4}
            expect(sl_compiler.compareDepartures(fakeRide1, fakeRide2)).toBe(-1)
        });
    })
});