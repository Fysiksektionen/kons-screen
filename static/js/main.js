"use strict"

function init() {

    var state = {
        event: false,
        time: moment().format("HH:mm"),
        date: moment().format("dddd D MMMM YYYY"),
        image: {
            url: "https://source.unsplash.com/random",
            text: ""
        },
        sl: {
            rides: [
                { type: "metro", number: 14, name: "Mörby Centrum", time: "12:34" },
                { type: "train", number: 29, name: "Näsby park", time: "13:30" },
                { type: "bus", number: 61, name: "Hornsborg?", time: "19:29" },
                { type: "metro", number: 14, name: "Mörby Centrum", time: "12:34" },
                { type: "train", number: 29, name: "Näsby park", time: "13:30" },
                { type: "bus", number: 61, name: "Hornsborg?", time: "19:29" },
                { type: "metro", number: 14, name: "Mörby Centrum", time: "12:34" },
                { type: "train", number: 29, name: "Näsby park", time: "13:30" },
                { type: "bus", number: 61, name: "Hornsborg?", time: "19:29" }
            ]
        },
        calendar: {
            events: [
                {date: "Tisdag 30 feb", time: "13:37", name: "Torsdagspubb"},
                {date: "Måndag 30 feb", time: "13:37", name: "Fysikalen"},
                {date: "Onsdag 30 feb", time: "13:37", name: "Torsdagspubb"},
                {date: "Lördag 30 feb", time: "13:37", name: "Fysikalen"},
                {date: "Fredag 30 feb", time: "13:37", name: "Ett väldigt långt namn på event"},
                {date: "Torsdag 30 feb", time: "13:37", name: "Torsdagspubb"},
                {date: "Söndag 30 feb", time: "13:37", name: "Fysikalen"},
                {date: "Tisdag 30 feb", time: "13:37", name: "Torsdagspubb"}
            ]
        }
    }
    renderState(state)
}

function renderState(state) {
    // init components
    var source = document.getElementById("app-template").innerHTML
    var template = Handlebars.compile(source)
    var html = template(state)
    document.getElementById("app").innerHTML = html

}

document.addEventListener('DOMContentLoaded', init, false)

setInterval(init, 10000)


// Localize dates with moment. (Om någon vill översätta resten av franskan så är de välkommna, har bara gjort det  som krävs nu)
moment.locale('se', {
    months : 'Januari_Februari_Mars_April_Maj_Juni_Juli_Augusti_September_Oktober_November_December'.split('_'),
    monthsShort : 'jan_feb_mar_apr_maj_jun_jul_aug_sep_okt_nov_dec'.split('_'),
    monthsParseExact : true,
    weekdays : 'Måndag_Tisdag_Onsdag_Torsdag_Fredag_Lördag_Söndag'.split('_'),
    weekdaysShort : 'mån_tis_ons_tor_fre_lör_sön'.split('_'),
    weekdaysMin : 'må_ti_on_to_fr_lö_sö'.split('_'),
    weekdaysParseExact : true,
    longDateFormat : {
        LT : 'HH:mm',
        LTS : 'HH:mm:ss',
        L : 'YYYY-MM-DD',
        LL : 'D MMMM YYYY',
        LLL : 'D MMMM YYYY HH:mm',
        LLLL : 'dddd D MMMM YYYY HH:mm'
    },
    calendar : {
        sameDay : '[Idag] LT',
        nextDay : '[Imorgon] LT',
        nextWeek : 'dddd [klockan] LT',
        lastDay : '[Igår] LT',
        lastWeek : '[Förra veckan] dddd [klockan] LT',
        sameElse : 'L'
    },
    relativeTime : {
        future : 'dans %s',
        past : 'il y a %s',
        s : 'quelques secondes',
        m : 'une minute',
        mm : '%d minutes',
        h : 'une heure',
        hh : '%d heures',
        d : 'un jour',
        dd : '%d jours',
        M : 'un mois',
        MM : '%d mois',
        y : 'un an',
        yy : '%d ans'
    },
    dayOfMonthOrdinalParse : /\d{1,2}(er|e)/,
    ordinal : function (number) {
        return number + (number === 1 ? 'er' : 'e');
    },
    meridiemParse : /PD|MD/,
    isPM : function (input) {
        return input.charAt(0) === 'M';
    },
    // In case the meridiem units are not separated around 12, then implement
    // this function (look at locale/id.js for an example).
    // meridiemHour : function (hour, meridiem) {
    //     return /* 0-23 hour, given meridiem token and hour 1-12 */ ;
    // },
    meridiem : function (hours, minutes, isLower) {
        return hours < 12 ? 'PD' : 'MD';
    },
    week : {
        dow : 1, // Monday is the first day of the week.
        doy : 4  // The week that contains Jan 4th is the first week of the year.
    }
});

