import React, { Component } from 'react';
import './css/screen.css';
import './css/calendar.css';
import './css/sl.css';
import './css/watermark.css';
const moment = require('moment-timezone')
require('moment/locale/sv')
moment.locale('sv')

const SLIcon = require('./img/icons/sl_icon.svg')
const SLMetroIcon = require('./img/icons/sl_metro.svg')
const SLBusIcon = require('./img/icons/sl_bus.svg')
const SLTramIcon = require('./img/icons/sl_tram.svg')
const CalendarIcon = require('./img/icons/calendar.svg')

const getState = require('./js/data_compilers/getState').getState


class SLItem extends Component {
    render() {return (
        <div className="sl-item">
            <div className="sl-item-inner">
                <img src={this.props.icon} className="sl-icon"></img>
                <span className="sl-line-number">{this.props.ride.LineNumber}</span>
                <span className="sl-line-name">{this.props.ride.Destination}</span>
                <span className="sl-right">
                    <span className="sl-stop">{this.props.ride.StopAreaName}</span>
                    <span className="sl-time">{this.props.ride.DisplayTime}</span>
                </span>
            </div>
        </div>
    )}
}

class SLDepartureSlide extends Component {
    render () {
        return (
            <div className="sl-departure-type">
                {this.props.rides.map((ride, i) =>
                    <SLItem ride={ride}
                        icon={this.props.icon} key={ride.StopAreaName+ride.JourneyNumber+ride.Destination}/>
                )}
                {this.props.rides.length < 9
                    ? Array(9 - this.props.rides.length).fill().map((ride, i) =>
                        i == 0
                            ? <SLItem ride={{Destination:"Inga fler avångar tillgängliga"}} icon={this.props.icon}/>
                            : <SLItem ride={{}} icon={this.props.icon}/>
                    )
                    :null
                }
            </div>
        )
    }
}


class CalendarItem extends Component {
    render() {
        return (
            <div className="cal-item">
                <div className="cal-item-inner">
                    <div className="cal-date">{this.props.item.date}</div>
                    <div className="cal-name">{this.props.item.name}</div>
                </div>
            </div>
        )
    }
}

class RightHeader extends Component {
    constructor(props){
        super(props)
        this.state = { ticker_value : this.props.current.value() }
        setInterval( () => 
            this.setState({ ticker_value: this.props.current.value() }),
            this.props.current.interval
        )
    }
    render() {
        return (
            <div className="right-header">
            <img src={this.props.icon} className="right-header-icon"></img>
            {this.props.title}
            <span className="right-header-current">{this.state.ticker_value}</span>
            </div>
        )
    }
}

class App extends Component {
    constructor (){
        super()
        this.state = {
            carousel_index:0,
            event: false,
            image: {
                src: "",
                text: ""
            },
            sl: {
                rides: {
                    metros:[],
                    buses:[],
                    trams:[] }
            },
            calendar: {
                events: []
            },
            instagram: []
        }
    }

    componentDidMount () {
        getState().then(state => {this.setState(state)})
            .then(() => {
                return this.state.instagram.length ? this.setState({
                    image: this.state.instagram[this.state.carousel_index]
                })
                : null
            })
            
        // Updatera allt state var 10 min för att hålla kalendern updaterad
        setInterval(() => getState().then(state => {this.setState(state)}), 1000*60);
    
        // Rotate the image every 30 seconds
        setInterval(() => {
            if (this.state.instagram.length) {
                this.setState({ carousel_index: (this.state.carousel_index + 1 ) % this.state.instagram.length })
                this.setState({ image: this.state.instagram[this.state.carousel_index] })
            }
        }, 10*1000)
    }

    render() {
        return (
                <div id="wrapper">
                    <div id="right">
                        <div id="top">
                            <div className="sl">
                                <RightHeader title="Tidtabell" icon={SLIcon} current={{
                                    value:() => moment().tz('Europe/Stockholm').format('HH:mm:ss'),
                                    interval:500}}
                                />
                                <div className="sl-items">
                                    <SLDepartureSlide rides={this.state.sl.rides.metros} icon={SLMetroIcon}/>
                                    <SLDepartureSlide rides={this.state.sl.rides.trams} icon={SLTramIcon}/>
                                    <SLDepartureSlide rides={this.state.sl.rides.buses} icon={SLBusIcon}/>
                                    <SLDepartureSlide rides={this.state.sl.rides.metros} icon={SLMetroIcon}/>
                                </div>
                            </div>
                        </div>
                        <div id="bottom">
                            <div className="cal">
                                <RightHeader title="Kalender" icon={CalendarIcon} current={{
                                    value:() => moment().tz('Europe/Stockholm').format('dddd D MMMM YYYY'),
                                    interval:60*1000}}
                                />
                                <div className="cal-items">
                                    {this.state.calendar.events.length
                                        ? this.state.calendar.events.map(item => <CalendarItem item={item}/>)
                                        : <p className="error-no-info">Ingen information tillgängling</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="left">
                        <img src={this.state.image.src} alt={"Hoppsan, något gick fel. Maila något argt till webmaster@f.kth.se"} className="img-left"/>
                        <div className="left-shadow"></div>
                        {this.state.image.src && this.state.image.text
                            ?   <div id="watermark">
                                    {/* <div class="wm-clock">{this.state.time}</div> */}
                                    <div className="wm-text">{this.state.image.text}</div>
                                </div>
                            :   null
                        }
                    </div>
                </div>
            );
        }
    }

export default App;
