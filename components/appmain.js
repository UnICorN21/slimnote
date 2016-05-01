/**
 * WeightChart.js
 * Created by Huxley on 11/18/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import LineChart from './linechart';
let debug = require('debug')('slimnote:appmain');
require('./styles/appmain.scss');

const DatePicker = require('material-ui/lib/date-picker/date-picker');
const TextField = require('material-ui/lib/text-field');

let injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

export default class AppMain extends React.Component {
    static displayName = 'Main';
    static current() {
        let date = new Date();
        return `${date.getFullYear()}-${date.getMonth() + 1}`;
    }
    static operateCoord(coord, type) {
        let ret = coord.split('-');
        switch(type) {
            case 'MINUS': {
                if (--ret[1] < 0) {
                    ret[1] = '12';
                    --ret[0];
                } else ret[1] += '';
                break;
            }
            case 'ADD': {
                if (++ret[1] > 12) {
                    ret[1] = '1';
                    ++ret[0];
                } else ret[1] += '';
                break;
            }
        }
        if (ret[1].length <= 1) ret[1] = '0' + ret[1];
        return ret.join('-');
    }
    constructor(props) {
        super(props);
        this.state = {
            input: {
                date: null,
                weight: null
            },
            history: null,
            coord: AppMain.current(),
            data: {
                labels: [],
                datasets: [ [], [] ]
            }
        }
    }

    /**
     * The only method to update the value of `this.state.data`.
     * @param data {array}
     * @param coord {string}
     */
    makeChange(data = this._raw, coord = AppMain.current()) {
        debug(data, coord);
        this.setState({
            coord: coord,
            data: {
                labels: (() => {
                    return data.length ? data.map(o => { return o.date; }) : [];
                })(),
                datasets: [
                    (() => { return data.length ? data.map(o => { return o.weight; }) : []; })(),
                    (() => { return data.length ? data.map(o => { return this._basic.target; }) : []; })()
                ]
            }
        });
        setTimeout(() => {
            debug('New state:', this.state);
        }, 0);
    }
    componentDidMount() {
        // `raw` is an array of object like `{date: xx, weight: xx}`.
        this._raw = JSON.parse(localStorage.getItem('data'));
        this._basic = JSON.parse(localStorage.getItem('basic'));
        this.setState({
            history: JSON.parse(localStorage.getItem('history') || '{}')
        });
        setTimeout(() => {
            debug('history is', this.state.history);
            var date = new Date();
            if (date.getDate() === 1 && localStorage.getItem('reset') !== '1') {
                let label = AppMain.operateCoord(AppMain.current(), 'MINUS');
                debug('label is', label);
                var newHistory = this.state.history;
                newHistory[label] = this._raw;
                this.setState({ history: newHistory });
                setTimeout(() => {
                    this._raw = [];
                    this.makeChange();
                    localStorage.setItem('data', JSON.stringify(this._raw));
                    localStorage.setItem('history', JSON.stringify(this.state.history));
                    localStorage.setItem('reset', 1);
                }, 0);
            } else {
                if (date.getDate() !== 1) {
                    localStorage.setItem('reset', 0);
                } 
                this.makeChange();
            }
        }, 0);
    }
    componentWillUnmount() {
        localStorage.setItem('data', JSON.stringify(this._raw));
        localStorage.setItem('history', JSON.stringify(this.state.history));
    }
    clearData() {
        this._raw = [];
        this.makeChange();
    }
    historyMin() {
        if (!this.state.history || Object.keys(this.state.history).length === 0) {
            debug('Call `historyMin` on a null history');
            return '9999-99';
        }
        return Array.prototype.sort.call(Object.keys(this.state.history))[0];
    }
    validate(d, w) {
        // check data validation firstly.
        if (d.length == 0 || w.length == 0) return false; 
        // check whether we have both values currently.
        // TODO: add prompt windows with proper info.
        var date = `${AppMain.current()}-${d}`, weight = parseFloat(w);
        // date should greater than the first point at least.
        if (function(a, b) {
            var alists = a.split('-').map((v) => { return parseInt(v); }), 
                blists = b.split('-').map((v) => { return parseInt(v); });
            if (alists.length < 3 || blists.length < 3) {
                debug('met an illegal date format in', a, b);
                return false;
            }
            return !(alists[0] >= blists[0] && alists[1] >= blists[1] && alists[2] >= blists[2]);
        }(date, this._basic.startDate)) return false;
        // weight should be in the (0.8 * target, 150].
        if (weight >= 150 || weight < this._basic.target * 0.8) return false;
        return true;
    }
    handleClick() {
        let date = (() => {
            let date = this.refs.date.getDate();
            return `${date.getDate()}`;
        })(),
            weight = this.refs.weight.getValue();
        if (this.validate(date, weight)) {
            this._raw.push({date: date, weight: weight});
            this.makeChange();
            localStorage.setItem('data', JSON.stringify(this._raw));
        }
    }
    handleLeftClick() {
        // This op should be valid if it could be toggled.
        let targetCoord = AppMain.operateCoord(this.state.coord, 'MINUS');
        debug('Set coord to', targetCoord);
        this.makeChange(this.state.history[targetCoord], targetCoord);
    }
    handleRightClick() {
        // This op should be valid if it could be toggled.
        let targetCoord = AppMain.operateCoord(this.state.coord, 'ADD');
        debug('Set coord to', targetCoord);
        this.makeChange(this.state.history[targetCoord], targetCoord);
    }
    render() {
        let leftArrowDisabled = this.historyMin() >= this.state.coord;
        let rightArrowDisabled = AppMain.current() <= this.state.coord;
        let clearDisabled = AppMain.current() !== this.state.coord;
        const commons = [
            {
                label: "my slim note",
                fill: true,
                backgroundColor: "rgba(255,205,86,0.4)",
                borderColor: "rgba(255,205,86,1)",
                pointBorderColor: "rgba(255,205,86,1)",
                pointBackgroundColor: "#fff",
            },
            {
                label: "target",
                backgroundColor: "rgba(75,192,192,0.4)",
                borderColor: "rgba(75,192,192,1)",
                pointBorderColor: "rgba(75,192,192,0.4)",
                pointBackgroundColor: "#fff",
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: "rgba(255,205,86,1)",
                pointHoverBorderColor: "rgba(255,205,86,1)",
                pointHoverBorderWidth: 2,
            }
        ];
        const options = {
            legend: {
                display: false,
            },
            tooltips: {
                callbacks: {
                    title: function(tooltipItem, data) {
                        return `Date: ${tooltipItem[0].xLabel}`;
                    },
                    label: function(tooltipItem, data) {
                        return `Weight: ${tooltipItem.yLabel}kg`;
                    },
                }
            },
            animation: {
                onComplete: () => {
                    let canvas = ReactDOM.findDOMNode(this.refs.graph);
                    let ctx = canvas.getContext('2d');
                    let text = this.state.coord;
                    ctx.fillStyle = "#eee";
                    ctx.font = "100px 'Slabo 27px'";
                    ctx.textBaseline = 'middle';
                    let textWidth = ctx.measureText(text).width; 
                    ctx.fillText(text, canvas.width / 2 - textWidth / 2, canvas.height / 2);
                },
            }

        };
        return (
            <div className="app-main">
                <div className="header-container">
                    <div className={`header-buttons ${AppMain.current() === this.state.coord ? '' : 'always-shown'}`}>
                        <button className="mdl-button mdl-js-button mdl-js-ripple-effect"
                                disabled={leftArrowDisabled} onClick={this.handleLeftClick.bind(this)}>
                            <i className="material-icons">keyboard_arrow_left</i>
                        </button>
                        <button className="mdl-button mdl-js-button mdl-js-ripple-effect"
                                disabled={clearDisabled} onClick={this.clearData.bind(this)}>
                            <i className="material-icons">clear</i>
                        </button>
                        <button className="mdl-button mdl-js-button mdl-js-ripple-effect"
                                disabled={rightArrowDisabled} onClick={this.handleRightClick.bind(this)}>
                            <i className="material-icons">keyboard_arrow_right</i>
                        </button>
                    </div>
                </div>
                <LineChart data={this.state.data} commons={commons} options={options} width={800} height={600} ref="graph"/>
                <div className={`mdl-grid interactive ${AppMain.current() === this.state.coord ? '' : 'hidden'}`}>
                    <div className="mdl-cell mdl-cell--4-col" >
                        <DatePicker floatingLabelText="Date" ref="date"/>
                    </div>
                    <div className="mdl-cell mdl-cell--4-col">
                        <TextField floatingLabelText="Weight" type="number" ref="weight"/>
                    </div>
                    <div className="mdl-cell mdl-cell--4-col mdl-cell--bottom">
                        <button className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={this.handleClick.bind(this)}>
                            <i className="material-icons">add</i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
