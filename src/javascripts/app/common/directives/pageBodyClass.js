import angular from 'angular';
import _ from 'lodash';

let module = angular.module('common.directives.pageBodyClass', []);
module.directive('pageBodyClass',($rootScope) => {
  'ngInject';
  return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        $rootScope.$on('$stateChangeStart',
          function (event, toState, toParams, fromState, fromParams) {
            //// Remove previous classes
            //_.each((elem.attr('custom-class') || '').split(' '), function(cl) {
            //  elem.removeClass(cl);
            //});
            //attrs.$set('custom-class', (toState.classes || []).join(' '));
          });

        $rootScope.$on('$stateChangeSuccess',
          function (event, toState, toParams, fromState, fromParams) {

            // Remove previous classes
            _.each((elem.attr('custom-class') || '').split(' '), function (cl) {
              elem.removeClass(cl);
            });
            attrs.$set('custom-class', (toState.classes || []).join(' '));

            // Add custom class
            var classes = elem.attr('custom-class');
            _.each(classes.split(' '), function (cl) {
              elem.addClass(cl);
            });
          });
      }
    };
  });
export default module;
