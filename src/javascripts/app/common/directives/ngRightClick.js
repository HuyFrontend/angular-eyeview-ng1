import angular from 'angular';
let module = angular.module('common.directives.ngRightclick', []);
module.directive('ngRightclick', ($parse) => {
  return function (scope, element, attrs) {
    var fn = $parse(attrs.ngRightclick);
    element.bind('contextmenu', function (event) {
      scope.$apply(function () {
        event.preventDefault();
        fn(scope, {$event: event});
      });
    });
  };
});
export default module;
