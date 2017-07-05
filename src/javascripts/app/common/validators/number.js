import angular from 'angular';

let module = angular.module('common.validators.number', []);
module.directive('ngNumber', () => {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, elem, attrs, ngModel) {
      // var validatorRegex = /^-?\d*.?\d*$/;
      var validatorRegex = /^[-+]?[0-9]*\.?[0-9]+$/;
      ngModel.$validators.number = function (value) {
        if (value) {
          var valid = validatorRegex.test(value);
          return valid;
        } else {
          return true;
        }
      };

      ngModel.$validators.numberMin = function (value) {
        if (value) {
          var valid = validatorRegex.test(value);
          if (valid) {
            if (attrs.min && value < parseFloat(attrs.min, 10)) {
              valid = false;
            }
          }
          return valid;
        } else {
          return true;
        }
      };

      ngModel.$validators.numberMax = function (value) {
        if (value) {
          var valid = validatorRegex.test(value);
          if (valid) {
            if (attrs.max && value > parseFloat(attrs.max, 10)) {
              valid = false;
            }
          }
          return valid;
        } else {
          return true;
        }
      };

      ngModel.$validators.numberMinLength = function (value) {
        if (value) {
          var valid = validatorRegex.test(value);
          if (valid) {
            if (attrs.minLength && value.length < parseInt(attrs.minLength, 10)) {
              valid = false;
            }
          }
          return valid;
        } else {
          return true;
        }
      };

      ngModel.$validators.numberMaxLength = function (value) {
        if (value) {
          var valid = validatorRegex.test(value);
          if (valid) {
            if (attrs.maxLength && value.length > parseInt(attrs.maxLength, 10)) {
              valid = false;
            }
          }
          return valid;
        } else {
          return true;
        }
      };
    }
  };
});
export default module;
