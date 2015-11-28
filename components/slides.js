/**
 * Slides.js
 * Created by Huxley on 11/21/15.
 */

import React from 'react';
import ReactDOM from 'react-dom';
require('./styles/slides.less');

const SelectField = require('material-ui/lib/select-field');
const TextField = require('material-ui/lib/text-field');

class Progress extends React.Component {
    static displayName = 'Progress';
    render() {
        return (
            <div className="progress">
                <span style={{ width: `calc(${this.props.done}% + 2px)` }}/>
            </div>
        );
    }
}

class Motion extends React.Component {
    static displayName = 'Motion';
    render() {
        let clazz = 'motion';
        if (this.props.addition && this.props.state !== 'current') clazz += ` ${this.props.addition}`;
        if (this.props.state === 'future') clazz += ` future from-${this.props.from}`;
        else if (this.props.state === 'past') clazz += ` done to-${this.props.to}`;
        return (
            <section className={clazz}>
                {this.props.children}
            </section>
        );
    }
}

export default class Slides extends React.Component {
    static displayName = 'Slides';
    constructor(props) {
        super(props);
        this.state = {
            steps: 0,
            gender: null,
            current: null,
            target: null
        };
    }
    _handleGenderChange(name, event) {
        this.setState({ gender: event.target.value });
    }
    _handleCurrentChange() {
        this.setState({ current: this.refs.current.getValue() });
    }
    _handleTargetChange() {
        this.setState({ target: this.refs.target.getValue() });
    }
    handleKeyDown(e) {
        switch(e.which) {
            case 37: case 38: this.prev(); break;
            case 13: case 39: case 40: this.next(); break;
        }
    }
    componentDidMount() {
        this._handleKeyDown = this.handleKeyDown.bind(this);
        document.addEventListener('keydown', this._handleKeyDown, false);
    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this._handleKeyDown, false);
        this._handleKeyDown = null;
    }
    prev() {
        if (this.state.steps <= 0) return;
        this.setState({ steps: this.state.steps - 1});
    }
    next() {
        if (this.state.steps > this._motions.length) return;
        else if (this.state.steps + 1 === this._motions.length) {
            localStorage.setItem('basic',
                `{"gender": "${this.state.gender}", "current": "${this.state.current}", "target": "${this.state.target}"}`);
            let date = (() => {
                let date = new Date();
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            })();
            localStorage.setItem('data', `[{"date": "${date}", "weight": "${this.state.current}"}]`);
            setTimeout(() => {
                if (this.props.doneCallback) this.props.doneCallback();
            }, 300);
        }
        this.setState({ steps: this.state.steps + 1 });
    }
    render() {
        let genders = [
            { payload: 'male', text: 'Male' },
            { payload: 'female', text: 'Female' }
        ];
        this._motions = [
            {
                from: 'bottom',
                to: 'top',
                addition: 'scale',
                content: <div className="great-text">Initialization</div>
            },
            {
                from: 'bottom',
                to: 'top',
                addition: 'scale',
                content: <SelectField floatingLabelText="Your gender"
                                      value={this.state.gender}
                                      onChange={this._handleGenderChange.bind(this, 'gender')}
                                      menuItems={genders}/>
            },
            {
                from: 'bottom',
                to: 'top',
                adddition: 'scale',
                content: <TextField floatingLabelText="Current Weight" ref="current"
                                    type="number" onChange={this._handleCurrentChange.bind(this)}/>
            },
            {
                from: 'bottom',
                to: 'top',
                adddition: 'scale',
                content: <TextField floatingLabelText="Target Weight" ref="target"
                                    type="number" onChange={this._handleTargetChange.bind(this)}/>
            }
        ];
        let motions = this._motions.map((m, idx) => {
            let state = null;
            if (idx > this.state.steps) state = 'future';
            else if (idx === this.state.steps) state = 'current';
            else  state = 'past';
            return (
                <Motion key={idx} state={state} from={m.from} to={m.to}
                        addition={m.addition ? m.addition : null}>
                    {m.content}
                </Motion>
            );
        });
        return (
            <div className="slides-main">
                <Progress done={this.state.steps / motions.length * 100}/>
                <div className="motions">
                    {motions}
                </div>
                <aside className="nav">
                    <button className="mdl-button mdl-js-button mdl-button mdl-js-ripple-effect"
                            onClick={this.prev.bind(this)} disabled={this.state.steps <= 0}>Prev</button>
                    <button className="mdl-button mdl-js-button mdl-button mdl-js-ripple-effect"
                            onClick={this.next.bind(this)} disabled={this.state.steps > this._motions.length}>Next</button>
                </aside>
            </div>
        );
    }
}
