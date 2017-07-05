import angular from 'angular';

let module = angular.module('common.filters.substring', [])
  .filter('substring', () => {
    return function (str, start, end) {
      return str.substring(start, end);
    };
  });
export default module;

