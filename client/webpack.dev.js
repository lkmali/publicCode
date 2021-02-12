const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');

module.exports = merge(common, {
    mode: 'development',
    output: {
        path: path.resolve(__dirname, "../server", "build")
    },
    devtool: 'inline-source-map',
    plugins: [
        new webpack.DefinePlugin({
            // global app config object
            config: JSON.stringify({
                api: {
                    url: 'http://localhost:10010',
                    base: 'http://localhost:10010/api/',
                    login: 'account/login',
                    user: 'user',
                    category: 'category',
                    item: 'item',
                    deliveryBoy: "deliveryBoy",
                    merchant: "merchant",
                    order: "order",
                    distance: "distance",
                    offerImage: "offerImage",
                    merchantCategory: "merchant/category",
                    merchantItem: "merchant/item",
                    merchantCart: "merchantCart",
                    orderDelivery: "orderDelivery",
                    unit: "unit"
                },
                firebase: {
                    apiKey: '',
                    authDomain: '',
                    databaseURL: '',
                    projectId: '',
                    storageBucket: '',
                    messagingSenderId: '',
                    appId: '',
                    measurementId: ''
                }
            })
        })
    ],
    devServer: {
        historyApiFallback: true,
        allowedHosts: [],
        port: 8766
    }
});
