module.exports = {
    entry: ['./client/index.js'],
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
    },
    output: {
        path: __dirname + '/static',
        filename: 'bundle.js'
    }
}
