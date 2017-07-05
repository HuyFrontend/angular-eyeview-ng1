import angular from 'angular';
let module = angular.module('common.directives.ngMatch', []);
  module.directive('ngMatch', ()=> {
    return {
      require: "ngModel",
      scope: {
        otherModelValue: "=ngMatch"
      },
      link: function (scope, element, attributes, ngModel) {
        ngModel.$validators.ngMatch = function (modelValue) {
          return modelValue === scope.otherModelValue;
        };

        scope.$watch("otherModelValue", function () {
          ngModel.$validate();
        });
      }
    };
  });
export default module;
