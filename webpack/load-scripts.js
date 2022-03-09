module.exports = ({tsconfigPath, checkTypes, compilerOptions: overrideCompilerOptions}) => webpackConfig => {
    const compilerOptions = overrideCompilerOptions ? {
        ...overrideCompilerOptions,
    } : undefined;

    if (compilerOptions) {
        console.log('Overriding typescript options with', JSON.stringify(compilerOptions, null, 2));
    }

    const scriptLoaders = [
        {
            loader: 'ts-loader',
            options: {
                // happyPackMode: true,
                configFile: tsconfigPath,
                compilerOptions
            }
        }
    ];

    // ------------------------------------
    // TypeScript
    // ------------------------------------
    webpackConfig.module.rules.push({
        test: /\.[j,t]s(x?)$/,
        exclude: /node_modules/,
        use: scriptLoaders
    });

    return webpackConfig;
};
