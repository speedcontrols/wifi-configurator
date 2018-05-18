const mode  = process.env.NODE_ENV === 'development' ? 'development' : 'production';
const debug = mode !== 'production';

const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const cmd_emu = require('./scripts/lib/cmd_emu.js');
const url = require('url');


module.exports = {
  devtool: debug ? 'inline-sourcemap' : '',
  mode,
  entry: './src/www/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: { /*minimize: true*/ }
          }
        ]
      },
      {
        test: /\.css$/,
        //use: [ MiniCssExtractPlugin.loader, 'css-loader' ]
        use: [
          { loader: 'style-loader', options: { sourceMap: debug } },
          { loader: 'css-loader' }
        ]
      }
    ]
  },
  devServer: {
    hot: debug,
    inline: debug,
    // With default `localhost` Firefox firefox fails with `fetch()` and HMR
    host: '127.0.0.1',
    before(app, server) {
      app.get('/cmd', (req, res) => {
        let cmd = decodeURI(url.parse(req.originalUrl).query);
        cmd = cmd === null ? '' : cmd;
        server.log.info(`cmd received: "${cmd}"`);
        let reply = cmd_emu(cmd, { gzip: true });
        server.log.info(`cmd reply: "${reply}"`);

        req.headers['if-none-match'] = '';
        req.headers['if-modified-since'] = '';
        res.send(reply);
      });
    },
    // Hack to track yaml form updates
    contentBase: [ './test/fixtures' ],
    watchContentBase: true
  },
  plugins: [
    new CleanWebpackPlugin([ 'build' ]),
    new HtmlWebPackPlugin({
      template: './src/www/index.html',
      inlineSource: debug ? null : '.(js)$', // embed all javascript
      filename: './index.html'
    }),
    new HtmlWebpackInlineSourcePlugin()
  ].concat(!debug ? [] : [
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin()
  ])
};
