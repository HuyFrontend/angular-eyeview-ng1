var _ = require('lodash');
var webpackSources = require('webpack-sources');

function OptimizeJsonAssetsPlugin(options) {
  this.options = options || {};

  if (this.options.assetNameRegExp === undefined) {
    this.options.assetNameRegExp = /\.json/g;
  }

  if (this.options.jsonProcessor === undefined) {
    this.options.jsonProcessor = require('jsonminify');
  }

  if (this.options.dist === undefined) {
    this.options.dist = 'dist';
  }

  if (this.options.canPrint === undefined) {
    this.options.canPrint = true;
  }
}

OptimizeJsonAssetsPlugin.prototype.print = function () {
  if (this.options.canPrint) {
    console.log.apply(console, arguments);
  }
};

OptimizeJsonAssetsPlugin.prototype.processJson = function (json) {
  return this.options.jsonProcessor(json);
};

OptimizeJsonAssetsPlugin.prototype.createJsonAsset = function (json, originalAsset) {
  return new webpackSources.RawSource(json);
};

OptimizeJsonAssetsPlugin.prototype.apply = function (compiler) {

  var self = this;

  compiler.plugin('emit', function (compilation, compileCallback) {
    self.print('\nStarting to optimize JSON...');

    var assets = compilation.assets;

    var jsonAssetNames = _.filter(
      _.keys(assets),
      function (assetName) {
        return assetName.match(self.options.assetNameRegExp);
      }
    );

    _.each(
      jsonAssetNames,
      function (assetName) {
        self.print('Processing ' + assetName + '...');
        var asset = assets[assetName];
        try {
          var originalJson = asset.source();
          if(Buffer.isBuffer(originalJson)){
            originalJson = originalJson.toString('utf-8');
          }
          var processedJson = self.processJson(originalJson);
          assets[assetName] = self.createJsonAsset(processedJson, asset);
          self.print('Processed ' + assetName + ', before: ' + originalJson.length + ', after: ' + processedJson.length + ', ratio: ' + (Math.round(((processedJson.length * 100) / originalJson.length) * 100) / 100) + '%');
        }
        catch (e) {
          console.log(e);
        }
      }
    );

    compileCallback();

  });
};

module.exports = OptimizeJsonAssetsPlugin;
