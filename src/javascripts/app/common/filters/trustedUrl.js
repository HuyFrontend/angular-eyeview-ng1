import angular from 'angular';

let module = angular.module('common.filters.trusted', [])
  .filter('trusted', ['$sce', ($sce) => {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }]);
export default module;

