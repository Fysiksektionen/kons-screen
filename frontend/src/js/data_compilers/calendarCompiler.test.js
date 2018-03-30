// Test suite for the compilation of the calendar data fetched.

const cal_compiler = require('./calendarCompiler')

// might seem silly but that's TDD for ya
it('returns the mock data', () => {
    const calendar = {}
    const result = cal_compiler.compileCalendar(calendar)
    expect(result).toEqual({
        calendar:{
            events: [
                {date: "Torsdag den 15 mars", name: "Torsdagspub"},
                {date: "Torsdag den 15 mars", name: "Fysikalen"},
                {date: "Torsdag den 15 mars", name: "Torsdagspub"},
                {date: "Torsdag den 15 mars", name: "Fysikalen"},
                {date: "Torsdag den 15 mars", name: "Ett väldigt långt namn på event"},
                {date: "Torsdag den 15 mars", name: "Torsdagspub"},
                {date: "Torsdag den 15 mars", name: "Fysikalen"},
                {date: "Torsdag den 15 mars", name: "Torsdagspub"}
            ]
        }
    })
})

