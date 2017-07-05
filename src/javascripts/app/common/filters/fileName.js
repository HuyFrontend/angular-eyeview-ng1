import angular from 'angular';

let module = angular.module('common.filters.fileName', [])
  .filter('fileName', () => {
    return function (value, special) {
      var fileName = value.substring(value.lastIndexOf('/') + 1);
      if (special) {
        fileName = fileName.split('_').splice(1, fileName.split('_').length - 1);
      }
      if (fileName.indexOf('?') > -1) {
        fileName = fileName.split('?')[0];
      }
      return fileName
    };
  });
export default module;

