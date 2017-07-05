const helpers = require('./helpers');

/**
 * Webpack Plugins
 */
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const DefinePlugin = require('webpack/lib/DefinePlugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * Webpack Constants
 */
const ENV = process.env.ENV = process.env.NODE_ENV = 'test';

/**
 * Webpack configuration
 *
 * See: http://webpack.github.io/docs/configuration.html#cli
 */
module.exports = {

  /**
   * Source map for Karma from the help of karma-sourcemap-loader &  karma-webpack
   *
   * Do not change, leave as is or it wont work.
   * See: https://github.com/webpack/karma-webpack#source-maps
   */
  devtool: 'inline-source-map',

  /**
   * Options affecting the resolving of modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#resolve
   */
  resolve: {

    /**
     * An array of extensions that should be used to resolve modules.
     *
     * See: http://webpack.github.io/docs/configuration.html#resolve-extensions
     */
    extensions: ['', '.js'],

    /**
     * Make sure root is src
     */
    root: helpers.root('src')

  },

  /**
   * Options affecting the normal modules.
   *
   * See: http://webpack.github.io/docs/configuration.html#module
   */
  module: {

    /**
     * An array of applied pre and post loaders.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
     */
    preLoaders: [

      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [helpers.root('node_modules')]
      },

      /**
       * Source map loader support for *.js files
       * Extracts SourceMaps for source files that as added as sourceMappingURL comment.
       *
       * See: https://github.com/webpack/source-map-loader
       */
      // {
      //   test: /\.js$/,
      //   loader: 'source-map-loader',
      //   exclude: [
      //   // these packages have problems with their sourcemaps
      //   helpers.root('node_modules/rxjs'),
      //   helpers.root('node_modules/@angular')
      // ]}

    ],

    /**
     * An array of automatically applied loaders.
     *
     * IMPORTANT: The loaders here are resolved relative to the resource which they are applied to.
     * This means they are not resolved relative to the configuration file.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-loaders
     */
    loaders: [

      /*
       * Json loader support for *.json files.
       *
       * See: https://github.com/webpack/json-loader
       */
      {
        test: /(common|modules).*\.json$/,
        // loader: 'json-loader'
        loader: 'file?name=[hash].[ext]',
        exclude: [/node_modules/]
      },
      {
        test: /\.json$/,
        loader: 'json',
        exclude: [/javascripts/]
        // loader: 'file?name=[hash].[ext]'
      },

      /* Raw loader support for *.html
       * Returns file content as string
       *
       * See: https://github.com/webpack/raw-loader
       */
      {
        test: /(common|modules).*\.html$/,
        loader: 'file-loader?name=[hash].[ext]',
        exclude: [helpers.root('src/index.html'), /node_modules/]
      },
      {
        test: /\.html$/,
        loader: 'raw-loader',
        exclude: [helpers.root('src/index.html'), /javascripts/]
      },

      /*
       * to string and css loader support for *.css files
       * Returns file content as string
       *
       */
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'to-string-loader!css-loader!resolve-url-loader'
        })
        // loaders: ['to-string-loader', 'css-loader', 'resolve-url-loader']
      },

      {
        test: /\.scss$/,
        exclude: /node_modules/,
        // loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader']
        // loaders: ['style-loader', 'css-loader', 'resolve-url-loader', /*'postcss-loader', */'sass-loader']
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: 'css-loader!resolve-url-loader!sass-loader'
        })
      },

      {test: /\.(svg|woff|woff2|ttf|eot)$/i, loader: "file?name=/assets/fonts/[name].[ext]"},
      {test: /\.(png|jpg|jpeg|gif|bmp)$/i, loader: "file?name=/assets/images/[name].[ext]"},
      {test: /jquery/, loader: "expose?jQuery"}

    ],

    /**
     * An array of applied pre and post loaders.
     *
     * See: http://webpack.github.io/docs/configuration.html#module-preloaders-module-postloaders
     */
    postLoaders: [

      /**
       * Instruments JS files with Istanbul for subsequent code coverage reporting.
       * Instrument only testing sources.
       *
       * See: https://github.com/deepsweet/istanbul-instrumenter-loader
       */
      // {
      //   test: /\.(js|ts)$/, loader: 'istanbul-instrumenter-loader',
      //   include: helpers.root('src'),
      //   exclude: [
      //     /\.(e2e|spec)\.ts$/,
      //     /node_modules/
      //   ]
      // }

    ]
  },

  /**
   * Add additional plugins to the compiler.
   *
   * See: http://webpack.github.io/docs/configuration.html#plugins
   */
  plugins: [

    /**
     * Plugin: DefinePlugin
     * Description: Define free variables.
     * Useful for having development builds with debug logging or adding global constants.
     *
     * Environment helpers
     *
     * See: https://webpack.github.io/docs/list-of-plugins.html#defineplugin
     */
    // NOTE: when adding more properties make sure you include them in custom-typings.d.ts
    new DefinePlugin({
      'ENV': JSON.stringify(ENV),
      'HMR': false,
      'process.env': {
        'ENV': JSON.stringify(ENV),
        'NODE_ENV': JSON.stringify(ENV),
        'HMR': false,
      }
    }),

    new ExtractTextPlugin("assets/css/styles.[hash].css"), // extract inline-css to file
  ],

  /**
   * Include polyfills or mocks for various node stuff
   * Description: Node configuration
   *
   * See: https://webpack.github.io/docs/configuration.html#node
   */
  node: {
    global: 'window',
    process: false,
    crypto: 'empty',
    module: false,
    clearImmediate: false,
    setImmediate: false
  }

};
