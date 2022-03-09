const HtmlWebpackPlugin = require('html-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = () => webpackConfig => {
    webpackConfig.plugins.push(
        new HtmlWebpackPlugin({
            template: './src/index.html'
        })
    );

    webpackConfig.plugins.push(
        new ESLintPlugin({
            context: '../',
            extensions: ["ts", "tsx"],
            fix: false,
            emitError: true,
            emitWarning: true,
            failOnError: true
        })
    );

    return webpackConfig;
};
