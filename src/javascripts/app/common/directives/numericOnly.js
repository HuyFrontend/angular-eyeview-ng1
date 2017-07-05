import angular from 'angular';
import jQuery  from 'jquery';

let module = angular.module('common.directives.numericOnly', []);

module.directive('numericOnly', () => {

  /**
   * only accept numeric character in text box
   * @param scope
   * @param elem
   * @param attrs
   * @param ngModelCtrl
   */
  function numericOnlyFn(scope, elem, attrs, ngModelCtrl) {
    var validatorRegex = /^-?\d*.?\d*$/;
    var keyCode = [8, 9, 35, 36, 37, 39, 46, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 109, 110, 189, 190];
    elem.bind("keydown", function (event) {
      if (jQuery.inArray(event.which, keyCode) === -1) {
        scope.$apply(function () {
          scope.$eval(attrs.numericOnly);
          event.preventDefault();
        });
        event.preventDefault();
      }

    });
  }

  return {
    restrict: "A",
    link: numericOnlyFn
  };
});

export default module;

