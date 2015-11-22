/**
 * WeightChart.js
 * Created by Huxley on 11/18/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { Line } from 'react-chartjs';
require('./appmain.less');

const DatePicker = require('material-ui/lib/date-picker/date-picker');
const TextField = require('material-ui/lib/text-field');
let injectTapEventPlugin = require('react-tap-event-plugin');

injectTapEventPlugin();

export default class AppMain extends React.Component {
    constructor(props) {
        super(props);
        let that = this;
        this._options = {
            showTooltips: false,
            onAnimationComplete: () => {
                let canvas = that.refs.graph.getDOMNode();
                let ctx = canvas.getContext('2d');
                let text = (() => {
                    let date = new Date();
                    return `${date.getFullYear()}.${date.getMonth() + 1}`;
                })();
                let textWidth = ctx.measureText(text).width;
                ctx.fillStyle = "#eee";
                ctx.font = "100px 'Slabo 27px'";
                ctx.textBaseline = 'middle';
                ctx.fillText(text, (canvas.width / 2) - (textWidth / 2), canvas.height / 2);
            }
        };
        this.state = {
            input: {
                date: null,
                weight: null
            },
            data: {
                labels: [],
                datasets: [
                    {
                        label: "my slim note",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data:[]
                    },
                    {
                        label: "target",
                        fillColor: "rgba(151,187,205,0.2)",
                        strokeColor: "rgba(151,187,205,1)",
                        pointColor: "rgba(151,187,205,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        data: []
                    }
                ]
            }
        }
    }
    makeChange() {
        this.setState({data: {
            labels: (() => {
                return this._raw.map(o => { return o.date.split('-')[2]; });
            })(),
            datasets: [
                {
                    label: "actual",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: (() => {
                        return this._raw.map(o => { return o.weight; });
                    })()
                },
                {
                    label: "target",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: (() => {
                        return this._raw.map(o => { return this._target; })
                    })()
                }
            ]
        }});
    }
    componentDidMount() {
        // `raw` is an array of object like `{date: xxxx-xx-xx, weight: xx}`.
        this._raw = JSON.parse(localStorage.getItem('data'));
        this._target = JSON.parse(localStorage.getItem('basic')).target;
        this.makeChange();
    }
    componentWillUnmount() {
        localStorage.setItem('data', JSON.stringify(this._raw));
    }
    handleClick() {
        let date = (() => {
            let date = this.refs.date.getDate();
            return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
        })(),
            weight = this.refs.weight.getValue();
        this._raw.push({date: date, weight: weight});
        this.makeChange();
        localStorage.setItem('data', JSON.stringify(this._raw));
    }
    render() {
        // TODO: Rewrite LineChart myself for future usage.
        return (
            <div className="app-main">
                <Line data={this.state.data} options={this._options} width="800" height="600" redraw ref="graph"/>
                <div className="mdl-grid interactive">
                    <div className="mdl-cell mdl-cell--4-col">
                        <DatePicker floatingLabelText="Date" ref="date"/>
                    </div>
                    <div className="mdl-cell mdl-cell--4-col">
                        <TextField floatingLabelText="Weight" type="number" ref="weight"/>
                    </div>
                    <div className="mdl-cell mdl-cell--4-col mdl-cell--bottom">
                        <button className="mdl-button mdl-js-button mdl-button mdl-js-ripple-effect add" onClick={this.handleClick.bind(this)}>
                            <i className="material-icons">add</i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
