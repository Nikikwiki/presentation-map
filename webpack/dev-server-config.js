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
            proxy: {
                ...makeProxyConfig(
                    '/external-services',
                    path.join(config.OMS_PATH, '/external-services'),
                    `${config.OMS_PROTOCOL}://${config.OMS_HOST}`,
                    {
                        bypass: setCookie
                    }
                ),
                ...makeProxyConfig(
                    '/container/2.0',
                    path.join(config.OMS_PATH, '/container/2.0'),
                    `${config.OMS_PROTOCOL}://${config.OMS_HOST}`,
                    {
                        bypass: setCookie
                    }
                )

            }
        }
    });

    return webpackConfig;
};
