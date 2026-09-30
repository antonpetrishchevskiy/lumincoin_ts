const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/app.ts',
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
        }),
        new CopyPlugin({
            patterns: [
                {from: './src/templates', to: 'templates'},
                {from: './src/static', to: 'static'},
                {from: './node_modules/bootstrap/dist/css/bootstrap.min.css', to: 'css'},
                {from: './node_modules/fontawesome-free/webfonts', to: 'webfonts'},
                {from: './node_modules/fontawesome-free/css/all.min.css', to: 'css'},
                {from: './node_modules/flatpickr/dist/flatpickr.min.css', to: 'css'},
            ],
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(css|scss)$/i,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader',
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
        clean: true,
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/',
    },
};