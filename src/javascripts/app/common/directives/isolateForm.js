import angular from 'angular';
import jQuery  from 'jquery';

let module = angular.module('common.directives.isolateForm', []);

module.directive('isolateForm', () => {
  return {
    restrict: 'A',
    require: '?form',
    link: function (scope, elm, attrs, ctrl) {
      if (!ctrl) {
        return;
      }

      // Do a copy of the controller
      var ctrlCopy = {};
      angular.copy(ctrl, ctrlCopy);

      // Get the parent of the form
      var parent = elm.parent().controller('form');
      // Remove parent link to the controller
      parent && parent.$removeControl(ctrl);

      // Replace form controller with a "isolated form"
      var isolatedFormCtrl = {
        $setValidity: function (validationToken, isValid, control) {
          ctrlCopy.$setValidity(validationToken, isValid, control);
          parent && parent.$setValidity(validationToken, true, ctrl);
        },
        $setDirty: function () {
          elm.removeClass('ng-pristine').addClass('ng-dirty');
          ctrl.$dirty = true;
          ctrl.$pristine = false;
        },
      };
      angular.extend(ctrl, isolatedFormCtrl);
    }
  };
});

export default module;

