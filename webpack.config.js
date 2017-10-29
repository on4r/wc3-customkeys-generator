const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: './src/app.js',
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	},
	module:	{
		rules: [{
			test: /\.scss$/,
			use: [{
				loader: 'style-loader'
			}, {
				loader: 'css-loader'
			}, {
				loader: 'sass-loader'
			}]
		}, {
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['es2017']
				}
			}
		}]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			hash: true
		})
	]
};
