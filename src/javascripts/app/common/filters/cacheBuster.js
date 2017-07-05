import angular from 'angular';
let module = angular.module('common.filters.cacheBuster', [])
  .filter('cacheBuster', (appConstant) => {
    return function (url) {
      let d = new Date();
      url = url.replace(/[?|&]_v=\d+/, '');
      url += url.indexOf('?') === -1 ? '?' : '&';
      url += '_v=' + appConstant.version;

      return url;
    };
  });
export default module;
