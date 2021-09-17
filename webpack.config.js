const path = require("path")
const webpack = require('webpack')
const BundleTracker = require('webpack-bundle-tracker')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: "./client/src/index.js",
    context: __dirname,
    output: {
        path: path.resolve(__dirname, "./client/static/js"),
        filename: "[name].js",
    },
    plugins: [
        new BundleTracker({filename: './webpack-stats.json'}),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("production"), // This has effect on the react lib size
            },
        }),
        new MiniCssExtractPlugin({filename: './client/static/css/app.css',})
    ],
    optimization: {
        minimize: true,
        emitOnErrors: true,
    },
    module: {
        rules: [
            {
                test: /\.js|.jsx$/,
                use: {loader: "babel-loader"},
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, "style-loader", "css-loader"],
            },
        ],
    },
}