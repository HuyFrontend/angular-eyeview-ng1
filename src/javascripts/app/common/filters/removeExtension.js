import angular from 'angular';

let module = angular.module('common.filters.removeExtension', [])
  .filter('removeExtension', () => {
    return function (str) {
      return str.substring(0, str.lastIndexOf('.'));
    };
  });
export default module;

