const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const commitHash = require('child_process')
		.execSync('git rev-parse --short HEAD')
		.toString()
		.trim();

module.exports = {
	entry: ['./src/app.js', './src/styles/styles.scss'],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './dist')
	},
	module:	{
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(png|jpg|gif)$/,
				use: ['file-loader']
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			__COMMIT_HASH__: JSON.stringify(commitHash),
		}),
		new HtmlWebpackPlugin({
			template: './src/index.html',
			favicon: './src/assets/favicon.ico',
			hash: true
		}),
		new MiniCssExtractPlugin({
			filename: "[name].css",
			chunkFilename: "[id].css"
		})
	]
};
