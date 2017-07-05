import angular from 'angular';

let module = angular.module('common.validators.decimal', []);

module.directive('decimal', () => {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, elem, attrs, ngModel) {
      ngModel.$validators.decimal = function (value) {
        value = value || '';
        var valid = /^-?\d*\.?\d+$/.test(value);
        return valid;
      };
    }
  };
});
export default module;
