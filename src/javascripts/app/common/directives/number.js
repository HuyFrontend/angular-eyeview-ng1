import angular from 'angular';
let module = angular.module('common.directives.number', []);
  module.directive('number', ($timeout) => {
    'ngInject';
      return {
        restrict: 'EA',
        require: '?ngModel',
        scope: {
          allowDecimal: '@',
          allowNegative: '@',
          minNum: '@',
          maxNum: '@'
        },

        /**
         * Link function for custom-integer
         * @param scope
         * @param element
         * @param attrs
         * @param ngModel
         */
        link: function (scope, element, attrs, ngModel) {
          if (!ngModel) {
            return;
          }

          /**
           * Check & set valid data
           */
          function checkData() {
            var inputValue = ngModel.$viewValue || '';
            var decimalFound = false;
            var digits = inputValue.split('').filter(function (s, i) {
              var b = (!isNaN(s) && s !== ' ');
              if (!b && attrs.allowDecimal && attrs.allowDecimal === "true") {
                if (s === "." && decimalFound === false) {
                  decimalFound = true;
                  b = true;
                }
              }
              if (!b && attrs.allowNegative && attrs.allowNegative === "true") {
                b = (s === '-' && i === 0);
              }

              return b;
            }).join('');

            if (attrs.maxNum && !isNaN(attrs.maxNum) && parseFloat(digits) > parseFloat(attrs.maxNum)) {
              digits = attrs.maxNum;
            }
            if (attrs.minNum && !isNaN(attrs.minNum) && parseFloat(digits) < parseFloat(attrs.minNum)) {
              digits = attrs.minNum;
            }
            ngModel.$setViewValue(digits);
            ngModel.$render();
            return digits;
            //ngModel = digits;
          }

          ngModel.$parsers.push(checkData);
        }
      };
    });
export default module;
