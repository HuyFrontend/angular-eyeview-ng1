import angular from 'angular';

let module = angular.module('common.filters.newLines', [])
  .filter('newLines', () => {
    return function (text) {
      return text ? text.replace(/\n/g, '<br/>') : '';
    };
  });

export default module;
