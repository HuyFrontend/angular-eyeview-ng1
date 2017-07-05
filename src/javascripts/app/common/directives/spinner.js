import angular from 'angular';
let module = angular.module('common.directives.spinner', []);
module.directive('spinner', ($timeout) => {
  'ngInject';
  return {
    restrict: 'E',
    template: '<i class="fa fa-spin fa-spinner"></i> {{loadingText}}',
    link: function (scope, elem, attrs) {
      scope.loadingText = attrs.text || '';
    }
  };
});
export default module;