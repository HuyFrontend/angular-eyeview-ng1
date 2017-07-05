import angular from 'angular';
import spectrum from 'spectrum-colorpicker';

let module = angular.module('common.directives.uiColorPicker', []);

module.directive('uiColorPicker', () => {
  return {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      change: '=ngChange'
    },
    replace: true,
    template: '<span><input class="input-small" /></span>',
    link: function (scope, element, attrs, ngModel) {
      var input = element.find('input');

      var changeColor = function (color) {
        scope.$apply(function () {
          ngModel.$setViewValue(color.toHexString());
          scope.change();
        });
      };

      var options = angular.extend({
        color: ngModel.$viewValue,
        move: function (color) {
          changeColor(color);
        },
        showButtons: false
      }, scope.$eval(attrs.options));

      ngModel.$render = function () {
        input.spectrum('set', ngModel.$viewValue || '');
      };

      input.spectrum(options);
    }
  };
});
export default module;