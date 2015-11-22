/**
 * footer.js
 * Created by Huxley on 11/22/15.
 */
import React from 'react';
import ReactDOM from 'react-dom';

const FlatButton = require('material-ui/lib/flat-button');
const FontIcon = require('material-ui/lib/font-icon');

export default class Footer extends React.Component {
    render() {
        return (
            <FlatButton linkButton={true} href="https://github.com/UnICorN21/slimnote" label="GitHub"/>
        );
    }
}