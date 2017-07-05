import angular from 'angular';

let module = angular.module('common.directives.autoFocus', []);
module.directive('autoFocus', ($timeout) => {
  'ngInject';
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      var delayTime = attrs.autoFocus ? parseInt(attrs.autoFocus) : 150;
      $timeout(function () {
        elem[0].focus();
      }, delayTime);
    }
  };
});
export default module;
