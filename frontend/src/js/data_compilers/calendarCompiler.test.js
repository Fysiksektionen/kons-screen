// Test suite for the compilation of the calendar data fetched.

const cal_compiler = require('./calendarCompiler')

describe('getDate', () => {
    let fakeMoment
    let momentObject
    let deps
    let getDate
    
    beforeEach(() => {
        momentObject = {format: jest.fn(), tz: jest.fn()}
        // once called, return an object with method format.
        fakeMoment = jest.fn().mockReturnValue(momentObject)
        deps = {moment: fakeMoment}
        getDate = cal_compiler.getDateFactory(deps)
    })

    it('returns expected if event.start.dateTime exists', () => {
        const event = {start:{dateTime:"2018-04-03T17:00:00+02:00"}}
        momentObject.format.mockReturnValue("tisdag 3 april 17:00")
        momentObject.tz.mockReturnValue(momentObject)

        const expected = "tisdag 3 april 17:00"
        const result = getDate(event)
        expect(result).toBe(expected)
        expect(fakeMoment).toBeCalledWith("2018-04-03T17:00:00+02:00")
        expect(momentObject.tz).toBeCalledWith('Europe/Stockholm')
        expect(momentObject.format).toBeCalledWith('dddd D MMMM HH:mm')
    })
    
    it("returns expected if event.start.date exists and not event.start.dateTime.",() => {
        const event = {start:{date:"2018-04-09"}}
        momentObject.format.mockReturnValue("måndag 9 april")
        momentObject.tz.mockReturnValue(momentObject)

        const expected = "måndag 9 april"
        const result = getDate(event)
        expect(result).toBe(expected)
        expect(fakeMoment).toBeCalledWith("2018-04-09")
        expect(momentObject.tz).toBeCalledWith('Europe/Stockholm')
        expect(momentObject.format).toBeCalledWith('dddd D MMMM')
    })

    it('returns expected if no start date was found.', () => {
        const event = {start:{}}
        const expected = 0
        const result = cal_compiler.getDate(event)
        expect(result).toBe(expected)
        expect(fakeMoment).toHaveBeenCalledTimes(0)
        expect(momentObject.format).toHaveBeenCalledTimes(0)
    })

    it('handles case where event.start was undefined', () => {
        const event = {}
        const expected = 0
        const result = cal_compiler.getDate(event)
        expect(result).toBe(expected)
        expect(fakeMoment).toHaveBeenCalledTimes(0)
        expect(momentObject.format).toHaveBeenCalledTimes(0)
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

