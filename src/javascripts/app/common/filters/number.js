import angular from 'angular';

let module = angular.module('common.filters.number', [])
  .filter('number', () => {
    return function (val) {
      if (/^\(.*\)$/.test(val)) {
        val = val.replace('(', '-').replace(')', '');
      }
      return val;
    };
  });
export default module;

