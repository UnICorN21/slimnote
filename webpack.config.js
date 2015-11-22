/**
 * webpack.config.js.js
 * Created by Huxley on 11/18/15.
 */
var webpack = require('webpack');

module.exports = {
    entry: {
        bundle: [
            //'webpack-dev-server/client?http://localhost:3000',
            //'webpack/hot/only-dev-server',
            './app.js'
        ]
    },
    output: {
        path: __dirname,
        filename: "[name].js"
    },
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: "style!css!autoprefixer!less"
            },
            {
                test: /\.jsx?$/,
                loader: 'babel',
                exclude: /node_modules/
            }
        ]
    },
    externals: {
        "child_process": "child_process",
        "remote": "remote"
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        //new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new webpack.NoErrorsPlugin()
    ]
};