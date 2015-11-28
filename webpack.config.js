/**
 * webpack.config.js.js
 * Created by Huxley on 11/18/15.
 */
var webpack = require('webpack');

var env = ' debug'; // Will be set in the make process

module.exports = {
    entry: {
        app: (function() {
            var ret = [];
            if ('debug' === env) {
                ret.push('webpack-dev-server/client?http://localhost:3000');
                ret.push('webpack/hot/only-dev-server');
            }
            ret.push('./app.js');
            return ret;
        })()
    },
    output: {
        path: __dirname + '/build',
        filename: "[name].bundle.js",
        chunkFilename: "[chunkhash].bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.less$/,
                loader: "style!css!autoprefixer!less"
            },
            {
                test: /\.jsx?$/,
                loader: 'source-map-loader!babel',
                exclude: /node_modules/
            }
        ]
    },
    plugins: (function() {
        var ret = [
            new webpack.NoErrorsPlugin()
        ];
        if ('debug' === env) {
            ret.push(new webpack.HotModuleReplacementPlugin());
        } else {
            ret.push(new webpack.optimize.DedupePlugin());
            ret.push(new webpack.optimize.UglifyJsPlugin());
        }
        return ret;
    })()
};
