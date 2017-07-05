import angular from 'angular';
import autosize from 'autosize';

let module = angular.module('common.directives.autoGrow', []);
module.directive('autoGrow', ($timeout) => {
  'ngInject';
  return function (scope, element) {
    var ta = autosize(element[0]);

    scope.$on('autosize:update', function () {
      $timeout(function () {
        autosize.update(ta);
      });
    });
  };
});
export default module;
