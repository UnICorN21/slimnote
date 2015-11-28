/**
 * WeightChart.js
 * Created by Huxley on 11/18/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import LineChart from './linechart';
let debug = require('debug')('slimnote:appmain');
require('./styles/appmain.less');

const DatePicker = require('material-ui/lib/date-picker/date-picker');
const TextField = require('material-ui/lib/text-field');

let injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();

export default class AppMain extends React.Component {
    static displayName = 'Main';
    static current = () => {
        let date = new Date();
        return `${date.getFullYear()}.${date.getMonth() + 1}`;
    };
    constructor(props) {
        super(props);
        this._showCoord = null; // {string} Format like YYYY-MM.
        this._showData = null; // {array} Its content will be draw on canvas.
        this._options = {
            showTooltips: false,
            onAnimationComplete: () => {
                let canvas = ReactDOM.findDOMNode(this.refs.graph);
                let ctx = canvas.getContext('2d');
                let text = AppMain.current();
                let textWidth = ctx.measureText(text).width;
                ctx.fillStyle = "#eee";
                ctx.font = "100px 'Slabo 27px'";
                ctx.textBaseline = 'middle';
                ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), canvas.height / 2);
            }
        };
        this._commons = [
            {
                label: "my slim note",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)"
            },
            {
                label: "target",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)"
            }
        ];
        this.state = {
            input: {
                date: null,
                weight: null
            },
            data: {
                labels: [],
                datasets: [ [], [] ]
            }
        }
    }
    makeChange() {
        this.setState({data: {
            labels: (() => {
                return this._showData.map(o => { return o.date.split('-')[2]; });
            })(),
            datasets: [
                (() => { return this._showData.map(o => { return o.weight; })})(),
                (() => { return this._showData.map(o => { return this._target; })})()
            ]
        }});
        setTimeout(() => {
            debug('New state data:', this.state.data);
        }, 0);
    }
    componentDidMount() {
        // `raw` is an array of object like `{date: xxxx-xx-xx, weight: xx}`.
        this._raw = JSON.parse(localStorage.getItem('data'));
        this._target = JSON.parse(localStorage.getItem('basic')).target;
        // TODO: fix bugs when a new month starts.
        this._showCoord = AppMain.current();
        this._showData = this._raw;
        this.makeChange();
        this._history = JSON.parse(localStorage.getItem('history') || '{}');
    }
    componentWillUnmount() {
        localStorage.setItem('data', JSON.stringify(this._raw));
        localStorage.setItem('history', JSON.stringify(this._history));
    }
    clearData() {
        this._raw = [];
        this._showData = [];
        this.makeChange();
    }
    historyMin() {
        if (!this._history || !this._history.keys) {
            debug('Call `historyMin` on a null _history');
            return null;
        }
        return Array.prototype.sort.call(this._history.keys)[0];
    }
    handleClick() {
        let date = (() => {
            let date = this.refs.date.getDate();
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        })(),
            weight = this.refs.weight.getValue();
        this._raw.push({date: date, weight: weight});
        this._showData = this._raw;
        this.makeChange();
        localStorage.setItem('data', JSON.stringify(this._raw));
    }
    handleLeftClick() {
        // TODO
    }
    handleRightClick() {
        // TODO
    }
    render() {
        let leftArrowDisabled = this.historyMin() >= this._showCoord;
        let rightArrowDisabled = AppMain.current() <= this._showCoord;
        let clearDisabled = this._showData !== this._raw;
        return (
            <div className="app-main">
                <div className="header-container">
                    <div className="header-buttons">
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
                <LineChart data={this.state.data} commons={this._commons} options={this._options} width={800} height={600} ref="graph"/>
                <div className="mdl-grid interactive">
                    <div className="mdl-cell mdl-cell--4-col">
                        <DatePicker floatingLabelText="Date" ref="date"/>
                    </div>
                    <div className="mdl-cell mdl-cell--4-col">
                        <TextField floatingLabelText="Weight" type="number" ref="weight"/>
                    </div>
                    <div className="mdl-cell mdl-cell--4-col mdl-cell--bottom" disabled={clearDisabled}>
                        <button className="mdl-button mdl-js-button mdl-js-ripple-effect" onClick={this.handleClick.bind(this)}>
                            <i className="material-icons">add</i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
