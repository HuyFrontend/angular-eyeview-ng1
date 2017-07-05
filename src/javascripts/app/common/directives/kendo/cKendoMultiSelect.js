import angular from 'angular';
import * as _ from 'lodash';

let module = angular.module('common.directives.cKendoMultiSelect', []);

module.directive('cKendoMultiSelect', () => {
  'ngInject';
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      source: '=ngSource',
      options: '=',
      placeholder: '@',
      noItemMessage: '@'
    },
    controllerAs: 'vm',
    bindToController: true,
    controller: [
      '$scope',
      function ($scope) {
        var vm = this;
        vm.options = vm.options || {};
        vm.placeholder = vm.placeholder || '';
        vm.noItemMessage = vm.noItemMessage || "No item";
      }
    ],
    link: function (scope, element, attrs, ngModel) {
      var options = angular.extend({
        change: function (e) {
          var value = this.value();
          scope.$apply(function () {
            ngModel.$setViewValue(_.map(value, function (v) {
              return v + '';
            }));
          });
        },
        select: function (e) {
          if (e.item.text() === scope.vm.noItemMessage) {
            e.preventDefault();
          }
        }
      }, scope.vm.options);

      function addNoItem() {
        var noItem = {};
        noItem[options.dataTextField] = scope.vm.noItemMessage;
        noItem[options.dataValueField] = scope.vm.noItemMessage;
        scope.vm.source = [noItem];
      }

      // Add placeholder
      element.attr('data-placeholder', scope.vm.placeholder);

      var optional = element.kendoMultiSelect(options).data("kendoMultiSelect");

      scope.$watchCollection('vm.source', function (val) {
        optional.dataSource.data(scope.vm.source);
        optional.value(ngModel.$viewValue);
        if (!scope.vm.source || !scope.vm.source.length) {
          addNoItem();
        }
      });

      scope.$on('cKendoMultiSelect:UpdateValue', function () {
        optional.value(ngModel.$viewValue);
      });

      //scope.$watch(function() {
      //  return ngModel.$viewValue;
      //}, function(val) {
      //  console.log(ngModel.$viewValue);
      //  if(val) {
      //    //optional.value(ngModel.$viewValue);
      //  }
      //});
    }
  };
});
export default module;
