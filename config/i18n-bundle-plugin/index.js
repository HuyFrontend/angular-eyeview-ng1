const glob = require('glob');
const path = require('path');
const Promise = require('promise');
const fs = require('fs');
const Chunk = require("webpack/lib/Chunk");
const _ = require('lodash');
const jsonminify = require("jsonminify");

function mergeOptions(a, b) {
  if (!b) return a;
  Object.keys(b).forEach(function (key) {
    a[key] = b[key];
  });
  return a;
}

function i18nBundlePlugin(options) {
  // Setup the plugin instance with options...
  this.options = {};

  if (typeof options.base === 'undefined') {
    throw new Error('Please add "base" config (string)');
  }

  // if (typeof options.languages === 'undefined') {
  //   throw new Error('Please add "languages" config (string array)');
  // }

  if (typeof options.out === 'undefined') {
    throw new Error('Please add "out" config (string)');
  }

  mergeOptions(this.options, options);
}

function exportFile(compilation, language) {
  return new Promise(function (resolve) {
    let result = {};
    language.files.forEach(function (langPath) {
      let langJsonObject = JSON.parse(fs.readFileSync(langPath, 'utf8'));
      Object.assign(result, langJsonObject);
    });
    let json = jsonminify(JSON.stringify(result)); //convert it back to json
    let filePath = [this.options.out, language.lang + '.json'].join('/');
    // Pushes the content of the given filename to the compilation assets
    // compilation.fileDependencies.push(filePath);
    // Export to assets folder
    compilation.assets[filePath] = {
      source: function () {
        return json;
      },
      size: function () {
        return json.length;
      }
    };
    resolve();
  }.bind(this));
}

function proccedExport(languages, compilation) {
  return new Promise(function (resolve) {
    let exportPromises = [];
    languages.forEach(function (l) {
      exportPromises.push(exportFile.call(this, compilation, l));
    }.bind(this));

    // Wait for export progress complete
    Promise.all(exportPromises).then(function () {
      // Insert this list into the Webpack build as a new file asset:
      resolve();
    });
  }.bind(this));
}


i18nBundlePlugin.prototype.apply = function (compiler) {
  compiler.plugin('emit', function (compilation, callback) {
    let promises = [];
    if (this.options.languages) {
      this.options.languages.forEach(function (el) {
        promises.push(new Promise(function (resolve) {
          glob([this.options.base, '/**/{i18n,il8n}/', el, '.json'].join(''), {}, function (er, files) {
            resolve({lang: el, files: files});
          });
        }.bind(this)));
      }.bind(this));

      // Wait for i18n files finding progress complete
      Promise.all(promises).then(function (languages) {
        proccedExport.call(this, languages, compilation)
          .then(()=> {
            callback();
          });
      }.bind(this));
    } else {
      glob([this.options.base, '/**/**/{i18n,il8n}/*.json'].join(''), {}, function (er, files) {
        // Find number of languages
        let numLangs = _.uniq(_.map(files, function (fp) {
            let fn = fp.substring(fp.lastIndexOf('/') + 1);
            return fn.substring(0, fn.lastIndexOf('.'));
          })),
          languages = [];
        // Separate languages files into numLangs
        numLangs.forEach(function (l) {
          promises.push(new Promise(function (resolve) {
            var reg = new RegExp(l + '\\.json$');
            var matchFiles = _.filter(files, function (f) {
              return reg.test(f);
            });
            languages.push({lang: l, files: matchFiles});
          }));
        });
        proccedExport.call(this, languages, compilation)
          .then(()=> {
            callback();
          });
      }.bind(this));
    }
  }.bind(this));
};

module.exports = i18nBundlePlugin;
