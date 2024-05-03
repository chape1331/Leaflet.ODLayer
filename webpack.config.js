const path = require('path');

module.exports = {
    entry: './src/L.ODLayer.js',
    output: {
        filename: 'L.ODLayer.min.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    externals: {
        'leaflet': 'L'
    }
}
