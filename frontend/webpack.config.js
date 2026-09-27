const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const flatpickr = require("flatpickr");

module.exports = {
    entry: './src/app.ts',
    mode: 'development',
    devServer: {
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
                template: './index.html',
            }
        ),
        new CopyPlugin({
            patterns: [
                {from: "./src/templates", to: "templates"},
                {from: "./src/static", to: "static"},
                {from: "./src/components", to: "components"},
                {from: "./node_modules/bootstrap/dist/js/bootstrap.bundle.min.js", to: "js"},
                {from: "./node_modules/bootstrap/dist/css/bootstrap.min.css", to: "css"},
                {from: "./node_modules/fontawesome-free/webfonts", to: "webfonts" },
                {from: "./node_modules/fontawesome-free/css/all.min.css", to: "css"},
                {from: "./node_modules/flatpickr/dist/flatpickr.min.css", to: "css"},
                {from: "./node_modules/flatpickr/dist/flatpickr.min.js", to: "js"},
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(css|scss)$/i,
                use: [
                    "style-loader",
                    "css-loader",
                    "sass-loader",
                ],
            },
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/'
    },
};
