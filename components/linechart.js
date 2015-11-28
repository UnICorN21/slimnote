/**
 * linechart.js
 * Created by Huxley on 11/28/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';

let debug = require('debug')('slimnote:linechart');
let difference = require('lodash/array/difference');
let Chart = require('chart.js').noConflict();

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
        this._chart = new Chart(this._ctx).Line(this.state.data, this.props.options);
    }
    componentWillUnmount() {
        this._chart = null;
        this._ctx = null;
    }
    componentWillReceiveProps(nextProps) {
        /**
         * Compare two arrays and output them differences.
         * Return fast, which means it'll return once it finds it's not only addition.
         * @param oldArray {array}
         * @param newArray {array}
         * @return {object} if all differences are adds, {false} otherwise.
         */
        function diff(oldData, newData) {
            function getter(data, idx, y=-1) {
                if (y !== -1) return data[y][idx];
                else return data.map(d => {
                    return d[idx];
                });
            }
            const len = data => { return data[0] ? data[0].length : 0; };
            const compare = (a, b) => { return difference(a, b).concat(difference(b, a)).length; };
            // check the length of datasets
            if (oldData.length !== newData.length) return false;
            // check the length of each dataset
            const leno = len(oldData), lenn = len(newData);
            if (leno > lenn) return false;
            let ret = [];
            for (let i = 0; i < lenn; ++i) {
                let odata = getter(oldData, i), ndata = getter(newData, i);
                if (leno > i && compare(odata, ndata)) return false;
                else if (leno <= i) ret.push({ idx: i, vals: ndata });
            }
            return ret;
        }
        let dr = diff(this.props.data.datasets, nextProps.data.datasets);
        this.setState({
            data: {
                labels: nextProps.data.labels,
                datasets: this._combine(nextProps.data.datasets, nextProps.commons)
            }
        });
        setTimeout(() => {
            debug('New state:', this.state);
        }, 0);
        // Add using `addData` but update/remove using `update`.
        if (!this._chart) return;
        if (!dr) setTimeout(() => {
            // Make sure `setState` is done.
            this._chart = new Chart(this._ctx).Line(this.state.data, this.props.options);
        }, 0);
        else dr.forEach(node => {
            this._chart.addData(node.vals, nextProps.data.labels[node.idx]);
        });
    }

    render() {
        return <canvas ref="main" width={this.props.width} height={this.props.height}/>;
    }
}