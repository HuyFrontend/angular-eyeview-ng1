import angular from 'angular';
import moment from 'moment';

let module = angular.module('common.validators.dateRange', []);

module.directive('dateRange', ($parse) => {
  'ngInject';
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModel) {
      ngModel.$validators.gtMaxDate = function (modelValue) {
        if (attrs.minDate) {
          var maxDateValue = angular.copy($parse(attrs.minDate)(scope));
          if (!maxDateValue) {
            return true;
          }
          return moment(modelValue).isValid() && moment(maxDateValue).isValid() && moment(modelValue).diff(moment(maxDateValue), 'days') >= 0;
        }
        return true;
      };

      ngModel.$validators.ltMinDate = function (modelValue) {
        if (attrs.maxDate) {
          var minDateValue = angular.copy($parse(attrs.maxDate)(scope));
          if (!minDateValue) {
            return true;
          }
          return moment(modelValue).isValid() && moment(minDateValue).isValid() && moment(minDateValue).diff(moment(modelValue), 'days') >= 0;
        }
        return true;
      };
    }
  };
});
export default module;
