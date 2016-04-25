/**
 * linechart.js
 * Created by Huxley on 11/28/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';

let debug = require('debug')('slimnote:linechart');
let difference = require('lodash/array/difference');
let Chart = require('chart.js');

// TODO: move the `animation.onComplete` callback into this to make the text as the background.
//  the following will be supported once `chart.js` upgrading to 2.10.
// class ChartBackgroundPlugin extends Chart.PluginBase {
//     beforeInit(chartInstance) { /* NULL */ }
//     afterInit(chartInstance) { /* NULL */ }
//
//     beforeUpdate(chartInstance) { /* NULL */ }
//     afterUpdate(chartInstance) { /* NULL */ }
//
//     beforeRender(chartInstance) { /* NULL */ }
//
//     beforeDraw(chartInstance) { /* TODO */ }
//     afterDraw(chartInstance) { /* NULL */ }
//
//     destroy(chartInstance) { /* NULL */ }
// }

// Chart.pluginService.register(new ChartBackgroundPlugin());

export default class LineChart extends React.Component {
    static displayName = 'LineChart';
    static propTypes = {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        commons: React.PropTypes.array.isRequired,
        data: React.PropTypes.object.isRequired,
        options: React.PropTypes.object
    };
    _combine(datasets, commons) {
        return datasets.map((dataset, idx) => {
            return Object.assign({}, commons[idx], { data: dataset });
        });
    }
    constructor(props) {
        super(props);
        this.state = {
            data: {
                labels: this.props.data.labels,
                datasets: this._combine(this.props.data.datasets, this.props.commons)
            }
        };
        debug('Initial state:', this.state);
    }
    componentDidMount() {
        this._ctx = ReactDOM.findDOMNode(this.refs.main).getContext('2d');
        this._chart = new Chart(this._ctx, {
            type: 'line',
            data: this.state.data,
            options: this.props.options,
        });
    }
    componentWillUnmount() {
        this._chart = null;
        this._ctx = null;
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            data: {
                labels: nextProps.data.labels,
                datasets: this._combine(nextProps.data.datasets, nextProps.commons)
            }
        });
        setTimeout(() => {
            debug('New state:', this.state);
            if (!this._chart) return;
            this._chart.data.datasets = this.state.data.datasets;
            this._chart.data.labels = this.state.data.labels;
            this._chart.update();
            this._chart.render();
        });
    }

    render() {
        return <canvas ref="main" width={this.props.width} height={this.props.height}/>;
    }
}