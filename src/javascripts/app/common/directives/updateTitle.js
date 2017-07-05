import angular from 'angular';

let module = angular.module('common.directives.updateTitle', []);
module.directive('updateTitle', ($rootScope) => {
  'ngInject';
  return {
    restrict: 'A',
    link: function (scope, element) {
      var listener = function (event, toState, toParams, fromState, fromParams) {
        var title = 'InsightUs - AMS-OD';
        if (toState.page_title) {
          title = toState.page_title;
        }
        if ($rootScope.appVer) {
          element.text(title + ' (' + $rootScope.appVer + ')');
        } else {
          element.text(title);
        }
      };
      $rootScope.$on('$stateChangeSuccess', listener);
    }
  };
});
export default module;
