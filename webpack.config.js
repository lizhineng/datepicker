const path = require('path')

module.exports = {
    entry: './src/index.js',
    devServer: {
        contentBase: './demo'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    output: {
        filename: 'datepicker.min.js',
        path: path.resolve(__dirname, 'dist')
    },
}
