
const path = require('path');
const glob = require('glob');
const merge = require('webpack-merge');
const HelloWorldPlugin = require('./plugins/demo');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const part = require('./webpack.part');

const PATHS = {
  app: path.join(__dirname,"src"),
  build: path.join(__dirname, "dist"),
};


const commonConfig = merge([
  {
    output: {
      publicPath: '/',
    },
  },
  {
    plugins: [
      new HtmlWebpackPlugin({
        title: 'webpack demo',
      }),
      new HelloWorldPlugin({ setting: true}),
    ],
  },
  part.loadJavaScript({include: PATHS.app}),
  part.setFreeVariable("HELLO","hello from config"),
]);

const productionConfig = merge([
  {
    output: {
      chunkFilename: "[name].[chunkhash:4].js",
      filename: "[name].[chunkhash:4].js",
    },
  },
  part.clean(PATHS.build),
  part.generateSourceMaps({ type: 'source-map'}),
  part.extractCSS({
    // use: "css-loader",
    use:["css-loader",part.autoprefix()],
  }),
  part.purifyCSS({
    paths: glob.sync(`${PATHS.app}/**/*.js`,{ nodir:true }),
  }),
  part.loadImages({
    options: {
      limit: 15000,
      name:"[name].[hash:4].[ext]",
    },
  }),
  // part.attachRevision(),
  part.minifyJavaScript(),
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial",
          },
        },
      },
      runtimeChunk: {
        name: 'manifest',
      },
    },
  },
]);

const developmentConfig = merge([
  part.devServer({
    host: process.env.host,
    port: process.env.port,
  }),
  part.loadCSS(),
  part.loadImages(),
])

module.exports = mode => {
  process.env.BABEL_ENV = mode;
  if(mode === 'production') {
    return merge(commonConfig,productionConfig,{mode});
  }
  return merge(commonConfig, developmentConfig, {mode});
  // const pages = [
  //   part.page({
  //     title: 'Webpack demo',
  //     entry: {
  //       app: PATHS.app,
  //     },
  //     chunks: ['app', 'manifest','vendors~app'],
  //   }),
  //   part.page({
  //     title: 'Another demo',
  //     path: 'another',
  //     entry: {
  //       another: path.join(PATHS.app,"another.js"),
  //     },
  //     chunks: ['another', 'manifest','vendors~app'],
  //   }),
  // ];
  // const config = mode === 'production'? productionConfig: developmentConfig;
  // // return pages.map(page =>
  // //   merge(commonConfig,config,page,{mode})
  // // );
  // return merge([commonConfig, config, { mode }].concat(pages));
};