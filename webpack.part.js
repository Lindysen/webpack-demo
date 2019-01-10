const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const PurifyCSSPlugin = require("purifycss-webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const GitRevisionPlugin = require("git-revision-webpack-plugin");
const UglifyWebpackPlugin = require("uglifyjs-webpack-plugin");

exports.devServer = ({host, port}={}) => ({
  devServer: {
    stats: 'errors-only',
    host, // Defaults to `localhost`
    port, // Defaults to 8080
    open: true,
    overlay: true,
  },
});


exports.loadCSS = ({ include,exclude } = {}) => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        include,
        exclude,
        use:["style-loader","css-loader"],
      },
    ],
  },
});

exports.extractCSS = ({include,exclude,use = []}) => {
  // Output extracted CSS to a file
  const plugin = new MiniCssExtractPlugin({
     filename: "[name].[contenthash:4].css",
  });
  return {
    module: {
      rules: [
        {
          test: /\.css$/,
          include,
          exclude,
          use:[
            MiniCssExtractPlugin.loader,
          ].concat(use),
        },
      ],
    },
    plugins: [plugin],
  };
};

exports.purifyCSS = ({ paths }) => ({
  plugins: [
    new PurifyCSSPlugin({ paths })
  ],
});

exports.autoprefix = () => ({
  loader: 'postcss-loader',
  options: {
    plugins:() => [require("autoprefixer")()],
  },
});

// 加载图片
exports.loadImages = ({include, exclude,options} = {}) => ({
  module: {
    rules: [
      {
        test: /\.(png|jpg)$/,
        include,
        exclude,
        use: {
          loader:"url-loader",
          options,
        }
      },
    ],
  },
});

exports.loadJavaScript = ({include,exclude} ={}) => ({
  module: {
    rules: [
      {
        test: /\.js$/,
        include,
        exclude,
        use: 'babel-loader',
      },
    ],
  },
});

exports.generateSourceMaps = ({type}) => ({
  devtool: type,
});

exports.clean = path => ({
  plugins: [new CleanWebpackPlugin([path])],
});

exports.attachRevision = () => ({
  plugins: [
    new webpack.BannerPlugin({
      banner: new GitRevisionPlugin().version(),
    }),
  ],
});

exports.minifyJavaScript = () => ({
  optimization: {
    minimizer: [ new UglifyWebpackPlugin({ sourceMap: true })],
  },
});


exports.setFreeVariable = (key,value) => {
  const env = {};
  env[key] = JSON.stringify(value);
  return {
    plugins: [ new webpack.DefinePlugin(env)],
  };
};

exports.page = ({
  path = " ",
  template = require.resolve(
    "html-webpack-plugin/default_index.ejs"
  ),
  title,
  entry,
  chunks,
} = {}) => ({
  entry,
  plugins: [
    new HtmlWebpackPlugin({
      chunks,
      filename: `${path && path+ '/'}index.html`,
      template,
      title,
    }),
  ],
});