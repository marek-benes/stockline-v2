const path = require('path');
const copy = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = _ => {
    return {
        entry: `./src/ts/index.ts`,
        devtool: 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, './dist'),
            compress: true,
            open: true,
            port: 1234
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,

                },
                {
                    test: /\.(css|scss)$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'resolve-url-loader',
                        'sass-loader?sourceMap'
                    ]
                },
                {
                    test: /\.hbs$/,
                    loader: 'handlebars-loader',
                    query: {
                        knownHelpers: [],
                        runtime: 'handlebars/runtime',
                    },
                },
                {
                    test: /\.(png|jp(e*)g|svg|gif)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 10000,
                                name: './images/[name].[ext]'
                            }
                        }
                    ]
                },
                {
                    test: /\.(woff|woff2|ttf|eot)$/,
                    use: {
                        loader: 'file-loader',
                        options: {
                            name: './fonts/[name].[ext]'
                        }
                    }
                }
            ]
        },
        plugins: [
            new CleanWebpackPlugin(),
            new copy({
                patterns: [
                    {from: './src/index.html', to: 'index.html'}
                ],
            }),
        ],
        resolve: {
            extensions: ['.ts', '.js'],
            modules: [
                path.resolve('./src'),
                path.resolve('./node_modules')
            ]
        },
        output: {
            filename: 'app.js',
            path: path.resolve(__dirname, `./dist`)
        },
        optimization: {
            minimize: true,
            minimizer: [new TerserPlugin()],
        },
    }
};
