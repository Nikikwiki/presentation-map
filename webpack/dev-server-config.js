const config = require('../config');
const path = require('path');

const makeProxyConfig = (path, rewriteTo, target, extra = {}) => ({
    [path]: {
        target: target,
        changeOrigin: true,
        logLevel: "debug",
        pathRewrite: {
            [`^${path}`]: rewriteTo
        },
        secure: false,
        ...extra
    }
});

const proxyCookies = {};

const setCookie = (req) => {
    req.headers.cookie = proxyCookies.cookie;
}

module.exports = () => webpackConfig => {
    Object.assign(webpackConfig, {
        devServer: {
            // hot: true,
            // host: config.DEV_SERVER_HOST,
            port: config.DEV_SERVER_PORT,
            historyApiFallback: true,
            static: config.CONTENT_PATH,
        }
    });

    return webpackConfig;
};
