import angular from 'angular';

let module = angular.module('common.directives.cKendoDatepicker', []);
module.directive('cKendoDatepicker', ($timeout,
                                      utilFactory) => {
  'ngInject';
  function linkFn(scope, elem, attrs, ngModel) {

    var instance, options = angular.copy(scope.vm.options), inputId = attrs.id;
    $timeout(function () {
      // generate id
      if (!inputId) {
        inputId = utilFactory.makeId(10);
      }

      // Add id attribute
      attrs.$set('id', inputId);
      // Fix max, min value
      if (angular.isDefined(options.max) && options.max !== null && options.max === "") {
        options.max = new Date(2100, 1, 1);
      }

      if (angular.isDefined(options.min) && options.min !== null && options.min === "") {
        options.min = new Date(1970, 1, 1);
      }

      // Set default value
      if (ngModel.$viewValue) {
        options.value = new Date(ngModel.$viewValue);
      }

      // Update ngModel
      options.change = function () {
        var value = this.value();
        scope.$apply(function () {
          ngModel.$setViewValue(value);
        });
      };

      if (options.showClearButton) {
        options.footer = "<button type='button' class='btn btn-xs btn-danger btn-cleardate' datepickerid='" + inputId + "'>Clear</button>";
      }

      instance = elem.kendoDatePicker(options).data("kendoDatePicker");

      angular.element(document).off('click', '.btn-cleardate');
      angular.element(document).on('click', '.btn-cleardate', function (e) {
        angular.element('#' + angular.element(e.target).attr('datepickerid')).data("kendoDatePicker").value(null)
      });

      // Watch max, min date and update range
      scope.$watch('vm.options.max', function (value) {
        if (value) {
          instance.setOptions({
            max: new Date(value)
          });
        }
      });
      scope.$watch('vm.options.min', function (value) {
        if (value) {
          instance.setOptions({
            min: new Date(value)
          });
        }
      });

      scope.vm.instance = instance;
    });
  }

  function controllerFn() {

  }

  return {
    restrict: 'A',
    require: 'ngModel',
    link: linkFn,
    controller: controllerFn,
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      instance: '=',
      options: '='
    }
  };
});
export default module;
