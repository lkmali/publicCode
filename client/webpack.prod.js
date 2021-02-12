const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require('webpack');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    output: {
        path: path.resolve(__dirname, "../server", "build"),
        chunkFilename: "[name].[chunkhash].bundle.js",
        filename: "[name].[chunkhash].bundle.js"
    },
    plugins: [
        new webpack.DefinePlugin({
            config: JSON.stringify({
                api: {
                    url: '/',
                    base: '/api/',
                    sendOtp: 'account/sendOtp',
                    verifyPhone: 'account/verifyPhone',
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
        }),
        new UglifyJsPlugin({
            uglifyOptions: {
                compress: {
                    drop_console: false
                }
            }
        })
    ]
});
