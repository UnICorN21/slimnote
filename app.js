/**
 * app.js
 * Created by Huxley on 11/18/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import AppMain from './appmain';
import Slides from './slides';
import Footer from './footer'
require('./base.less');

let container = document.getElementById('container');
let footer = document.getElementById('footer');

if (!localStorage.getItem('basic')) {
    let main = () => {
        ReactDOM.unmountComponentAtNode(container);
        ReactDOM.render(
            <AppMain/>,
            container
        );
    };

    ReactDOM.render(
        <Slides doneCallback={main}/>,
        container
    );
} else {
    ReactDOM.render(
        <AppMain/>,
        container
    );
}

ReactDOM.render(
    <Footer/>,
    footer
);
