// Test suite for the compilation of the calendar data fetched.

const cal_compiler = require('./calendarCompiler')

describe('getDate', () => {
    it('returns expected if event.start.dateTime exists', () => {
        event = {start:{dateTime:"2018-04-03T17:00:00+02:00"}}
        const expected = "tisdag 3 april 17:00"
        const result = cal_compiler.getDate(event)
        expect(result).toBe(expected)
    })  
    
    it("returns expected if event.start.date exists and not event.start.dateTime.",() => {
        event = {start:{date:"2018-04-09"}}
        const expected = "måndag 9 april"
        const result = cal_compiler.getDate(event)
        expect(result).toBe(expected)
    })

    it('returns expected if no start date was found.', () => {
        event = {start:{}}
        const expected = 0
        const result = cal_compiler.getDate(event)
        expect(result).toBe(expected)
    })

    it('handles case where event.start was undefined', () => {
        event = {}
        const expected = 0
        const result = cal_compiler.getDate(event)
        expect(result).toBe(expected)
    })
})

describe('remapEvent', () => {
    it('correctly calls dependencies and returns expected format', () => {
        const event = {location:'ISS', summary: 'Come visit!'}

        const dateGetter = jest.fn().mockReturnValue('fakedate')
        const remapEvent = cal_compiler.remapperFactory(dateGetter)
        
        const result = remapEvent(event)
        expect(dateGetter).toBeCalledWith(event)
        expect(result).toEqual({
            date: 'fakedate',
            location: 'ISS',
            name: 'Come visit!'
        })
    })
})

describe('compileCalendar', () => {
    it('correctly calls dependencies and returns expected format', () => {
        const remapper = jest.fn().mockImplementation(e => e)
        const calendarEvents = [
            {otherprop:2, date:420}, 
            {randomprop:42, location:'kons', name:'pub'}
        ]
        const compileCalendar = cal_compiler.compileCalendarFactory(remapper)

        const expected = {calendar : {events : calendarEvents }}
        const result = compileCalendar(calendarEvents)
        expect(remapper.mock.calls[0][0]).toEqual({otherprop:2, date:420})
        expect(remapper.mock.calls[1][0]).toEqual({randomprop:42, location:'kons', name:'pub'})
        expect(remapper).toHaveBeenCalledTimes(2)
        expect(result).toEqual(expected)
    })
})

