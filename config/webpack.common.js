const webpack = require('webpack');
const helpers = require('./helpers');
const path = require('path');
const appVendor = require('./../src/main.vendor');

/*
 * Webpack Plugins
 */
// problem with copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlElementsPlugin = require('./html-elements-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CommonsPlugin = new require("webpack/lib/optimize/CommonsChunkPlugin");

/*
 * Webpack Constants
 */
const METADATA = {
  title: 'Eyeview',
  baseUrl: '/',
  isDevServer: helpers.isWebpackDevServer()
};

/*
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = {

  /*
   * Cache generated modules and chunks to improve performance for multiple incremental builds.
   * This is enabled by default in watch mode.
   * You can pass false to disable it.
   *
   * See: http://webpack.github.io/docs/configuration.html#cache
   */
  //cache: false,

  /*
   * The entry point for the bundle
   * Our Angular.js app
   *
   * See: http://webpack.github.io/docs/configuration.html#entry
   */
  entry: {
    'lib': [
      'jquery',
      'lodash',
      'angular'
    ],
    'vendor': appVendor.vendors,
    'main': './src/main.browser.js'
  },

  /*
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /*
     * An array of extensions that should be used to resolve modules.
     * you can now require('file') instead of require('file.js')
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['.js', '.json'],

    // Make sure root is src
    // root: helpers.root('src'),

    // remove other default values
    // modulesDirectories: ['node_modules'],
    modules: [helpers.root('src'), helpers.root('node_modules')],

    alias: {
      jquery: require.resolve('jquery'), // make jquery global
      'app': path.join(__dirname, '../src/javascripts/app'),
      'js': path.join(__dirname, '../src/js')
    }
  },

  /*
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    //preLoaders: [
    //  {
    //    test: /\.js$/,
    //    loader: 'eslint-loader',
    //    include: [/src\/javascripts/],
    //    exclude: [/node_modules/, /\.(spec|e2e)\.js$/, /jquery/]
    //  }
    //],

    /*
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-loaders
     */
    rules: [
      {
        test: /\.js$/,
        use: [
          'ng-annotate-loader',
          'babel-loader?compact=false'
        ],
        exclude: [/node_modules/, /\.(spec|e2e)\.js$/]
      },


      /*
       * Json loader support for *.json files.
       *
       * See: https://github.com/webpack/json-loader
       */
      {
        test: /\.json$/,
        use: 'json-loader'
        // loader: 'file?name=[hash].[ext]'
      },

      /*
       * to string and css loader support for *.css files
       * Returns file content as string
       *
       */
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {loader: "to-string-loader"},
            {loader: "css-loader"},
            {loader: "resolve-url-loader"},
          ]
          // loaders: ['to-string-loader', 'css-loader', 'resolve-url-loader']
        })
      },

      // /* File loader for supporting images, for example, in CSS files.
      //  */
      // {
      //   test: /\.(jpg|png|gif)$/,
      //   loader: 'file'
      // },

      {
        test: /\.scss$/,
        exclude: /node_modules/,
        // loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
        // loaders: ['style-loader', 'css-loader', 'resolve-url-loader', /*'postcss-loader', */'sass-loader']
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {loader: "css-loader"},
            {loader: "resolve-url-loader"},
            {loader: "sass-loader"},
          ]
        })
      },

      {test: /\.(svg|woff|woff2|ttf|eot)$/i, use: "file-loader?name=/assets/fonts/[name].[ext]"},
      {test: /\.(png|jpg|jpeg|gif|bmp)$/i, use: "file-loader?name=/assets/images/[name].[ext]"}
      // {test: /jquery/, loader: "expose?jQuery"}
    ]

  },

  /*
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    /*
     * Plugin: CommonsChunkPlugin
     * Description: Shares common code between the pages.
     * It identifies common modules and put them into a commons chunk.
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
     * See: https://github.com/webpack/docs/wiki/optimization#multi-page-app
     */
    // new webpack.optimize.CommonsChunkPlugin({
    //   name: ['polyfills', 'vendor'].reverse()
    // }),

    /*
     * Plugin: CopyWebpackPlugin
     * Description: Copy files and directories in webpack.
     *
     * Copies project static assets.
     *
     * See: https://www.npmjs.com/package/copy-webpack-plugin
     */
    new CopyWebpackPlugin([{
      from: 'src/assets',
      to: 'assets'
      },
      {
        from: 'src/img',
        to: 'img'
      },
      {
        from: 'src/fonts',
        to: 'fonts'
      },
      {
        from: 'src/js',
        to: 'js'
      }
      ]),

    /*
     * Plugin: HtmlWebpackPlugin
     * Description: Simplifies creation of HTML files to serve your webpack bundles.
     * This is especially useful for webpack bundles that include a hash in the filename
     * which changes every compilation.
     *
     * See: https://github.com/ampedandwired/html-webpack-plugin
     */

    // Injects bundles in your index.html instead of wiring all manually.
    // It also adds hash to all injected assets so we don't have problems
    // with cache purging during deployment.
    new HtmlWebpackPlugin({
      template: 'src/index.html',
      // chunksSortMode: 'dependency'
      chunksSortMode: helpers.packageSort(['lib', 'vendor', 'main']),
      title: METADATA.title,
      metadata: METADATA,
      inject: 'head'
    }),

    /*
     * Plugin: HtmlHeadConfigPlugin
     * Description: Generate html tags based on javascript maps.
     *
     * If a publicPath is set in the webpack output configuration, it will be automatically added to
     * href attributes, you can disable that by adding a "=href": false property.
     * You can also enable it to other attribute by settings "=attName": true.
     *
     * The configuration supplied is map between a location (key) and an element definition object (value)
     * The location (key) is then exported to the template under then htmlElements property in webpack configuration.
     *
     * Example:
     *  Adding this plugin configuration
     *  new HtmlElementsPlugin({
     *    headTags: { ... }
     *  })
     *
     *  Means we can use it in the template like this:
     *  <%= webpackConfig.htmlElements.headTags %>
     *
     * Dependencies: HtmlWebpackPlugin
     */
    new HtmlElementsPlugin({
      headTags: require('./head-config.common')
    }),

    // new i18nBundlePlugin({
    //   base: 'src/javascripts',
    //   // languages: ['en', 'vi'],
    //   out: 'assets/languages'
    // }),

    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      'window.jQuery': 'jquery' // Kendo
    }),

    // Prevent external plugin to append existing library on the chunk. e.g: prevent ng-table to append angular lib into chunk file
    new CommonsPlugin({
      minChunks: 3,
      name: "lib"
    }),

    new ExtractTextPlugin("assets/css/styles.[hash].css"), // extract inline-css to file
    // new webpack.optimize.CommonsChunkPlugin({names: ['lib', 'vendor', 'main'], minChunks: Infinity}),
    // new webpack.optimize.OccurrenceOrderPlugin(true),
    // Automatically move all modules defined outside of application directory to vendor bundle.
    // If you are using more complicated project structure, consider to specify common chunks manually.
    // new webpack.optimize.CommonsChunkPlugin({name: "vendor.lib", filename: "[name].[hash].bundle.js", minChunks: Infinity}),
    // new webpack.optimize.CommonsChunkPlugin({name: "vendor.jquery", filename: "[name].[hash].bundle.js", minChunks: Infinity}),
    // new webpack.optimize.CommonsChunkPlugin({name: "vendor.angular", filename: "[name].[hash].bundle.js", minChunks: Infinity})

    // http://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
    // new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /de|fr|hu/)
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ],

  /*
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: true,
    crypto: 'empty',
    process: true,
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

};
