import React, { Component } from 'react';
import './css/screen.css';
import './css/calendar.css';
import './css/sl.css';
import './css/watermark.css';
const SLIcon = require('./img/icons/sl_icon.svg')
const SLMetroIcon = require('./img/icons/sl_metro.svg')
const SLBusIcon = require('./img/icons/sl_bus.svg')
const SLTramIcon = require('./img/icons/sl_tram.svg')
const CalendarIcon = require('./img/icons/calendar.svg')

const getState = require('./js/data_compilers/getState').getState


class SLItem extends Component {
    render() {return (
        <div className="sl-item">
            <img src={this.props.icon} className="sl-icon"></img>
            <span className="sl-line-number">{this.props.ride.LineNumber}</span>
            <span className="sl-line-name">{this.props.ride.Destination}</span>
            <span className="sl-right">
                <span className="sl-stop">{this.props.ride.StopAreaName}</span>
                <span className="sl-time">{this.props.ride.DisplayTime}</span>
            </span>
        </div>
    )}
}

class SLDepartureSlide extends Component {
    render () {
        return (
            <div className="sl-departure-type">
                {this.props.rides.map((ride, i) =>
                    <SLItem ride={ride}
                            icon={this.props.icon}/>
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
                <div className="cal-date">{this.props.item.date}</div>
                <div className="cal-name">{this.props.item.name}</div>
            </div>
        )
    }
}

class RightHeader extends Component {
    render() {
        return (
            <div className="right-header">
            <img src={this.props.icon} className="right-header-icon"></img>
            {this.props.title}
            <span className="right-header-current">{this.props.current}</span>
            </div>
        )
    }
}

class App extends Component {
    constructor (){
        super()
        this.state = {
            event: false,
            time: new Date().toLocaleTimeString().substr(0,8),
            date: new Date().toDateString(),
            image: {
                url: "https://source.unsplash.com/random",
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
            }
        }
    }

    componentDidMount () {
        getState().then(state => this.setState(state))

        setInterval(() => {
          getState().then(state => this.setState(state))
      }, 10000);

      setInterval(() =>
        this.setState({
            time: new Date().toLocaleTimeString().substr(0,8),
            date: new Date().toDateString()
        }), 500);
    }

    render() {
        return (
                <div id="wrapper">
                    <div id="right">
                        <div id="top">
                            <div className="sl">
                                <RightHeader title="Tidtabell" icon={SLIcon} current={this.state.time}/>
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
                                <RightHeader title="Kalender" icon={CalendarIcon} current={this.state.date}/>
                                <div className="cal-items">
                                    {this.state.calendar.events.length
                                        ? this.state.calendar.events.map(item => <CalendarItem item={item}/>)
                                        : <p className="error-no-info">Ingen information tillgängling</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="left">
                        <img src={this.state.image.url} alt="Hoppsan, något gick fel. Maila något argt till webmaster@f.kth.se" className="img-left"/>
                        <div className="left-shadow"></div>
                    </div>
                </div>
            );
        }
    }

export default App;
