import * as _ from 'lodash';
import angular from 'angular';

let module = angular.module('common.validators.distinct', []);
module.directive('distinct', () => {
  return {
    require: "ngModel",
    scope: {
      options: '=?distinctOptions',
      list: '=?distinct'
    },
    controller: function () {

    },
    controllerAs: 'vm',
    bindToController: true,
    link: function (scope, element, attributes, ngModel) {
      var defaultOptions = {
        caseSensitive: false
      };

      /**
       * Init
       */
      function init() {
        _.extend(defaultOptions, scope.vm.options);
      }

      /**
       * Check if 2 value is equal
       * @param s1
       * @param s2
       * @returns {boolean}
       */
      function isEqual(s1, s2) {
        s1 = s1 || '';
        s2 = s2 || '';
        if (!defaultOptions.caseSensitive) {
          return s1.toUpperCase() === s2.toUpperCase();
        }
        return s1 === s2;
      }

      ngModel.$validators.distinct = function (modelValue) {
        // Distinct is valid when no item in list have same field value
        return angular.isUndefined(_.find(scope.vm.list, function (l) {
          return isEqual(l[defaultOptions.field], modelValue);
        }));
      };
      init();
    }
  };
});
export default module;
