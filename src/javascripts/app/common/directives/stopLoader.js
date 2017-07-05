import angular from 'angular';

let module = angular.module('common.directives.stopLoader', []);
  module.directive('stopLoader', ($timeout,
             $rootScope) =>  {
    'ngInject';
      /**
       * Stop preloader to target element
       * @param scope
       * @param element
       */
      function autoFocusLinkFn(scope, element) {
        element.addClass('loaded');
        $timeout(function() {
          element.find('#loader-wrapper').remove();
          $rootScope.pageLoaded = true;
        }, 1000);
      }

      return {
        restrict: 'A',
        link: autoFocusLinkFn
      };
    });
export default module;
