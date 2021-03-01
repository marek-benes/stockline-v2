const fs = require("fs");
const path = require("path");
const copy = require("copy-webpack-plugin");

module.exports = env => {
    // if (!env.development) {
    //     fs.mkdirSync(`./dist`, {recursive: true});
    // }

    return {
        entry: `./src/index.ts`,
        devtool: "source-map",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: {
                        loader: "ts-loader",
                    },
                    exclude: /node_modules/,
                },
                {
                    test: /\.(css|scss)$/,
                    use: [
                        "style-loader",
                        "css-loader",
                        "resolve-url-loader",
                        "sass-loader?sourceMap"
                    ]
                },
                {
                    test: /\.hbs$/,
                    loader: 'handlebars-loader'
                },
                {
                    test: /\.(png|jp(e*)g|svg|gif|woff)$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                limit: 200000,
                                name: "./images/[name].[ext]"
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
            new copy({
                    patterns: [
                        {
                            from: `./src/index.html`,
                            to: "index.html"
                        }
                    ]
                }
            )
        ],
        resolve: {
            extensions: [".ts", ".js"],
            modules: [
                path.resolve("./src"),
                path.resolve("./node_modules")
            ]
        },
        output: {
            filename: "app.js",
            path: path.resolve(__dirname, `dist`)
        }
    }
};
