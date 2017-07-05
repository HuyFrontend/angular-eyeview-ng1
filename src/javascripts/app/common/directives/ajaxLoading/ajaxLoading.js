import angular from 'angular';

let module = angular.module('common.directives.ajaxLoading', []);

module.factory('ajaxLoadingFactory', ($rootScope) => {
  'ngInject';

  let services = {};

  services.nextRequestLoader = true;

  services.show = function () {
    $rootScope.$broadcast('ajaxLoading.show');
  };

  services.hide = function () {
    $rootScope.$broadcast('ajaxLoading.hide');
  };

  services.clear = function () {
    $rootScope.$broadcast('ajaxLoading.clear');
  };

  services.hideNextRequestLoader = function () {
    services.nextRequestLoader = false;
  };

  services.nextRequestLoaderOptions = function (options) {
    services.nextRequestLoader = options.nextRequestLoader;
  };

  return services;
});

module.directive('ajaxLoading', ($timeout,
                                 ajaxLoadingFactory) => {
  'ngInject';
  return {
    restrict: 'E',
    templateUrl: require('app/common/directives/ajaxLoading/templates/ajaxLoading.html'),
    link: function (scope, elem, attrs) {
      let $element = elem.children('.overlay-layer'), timer, count = 0;

      function showLoading() {
        if ($element[0]) {
          if (timer) {
            $timeout.cancel(timer);
          }

          // Show element
          $element.addClass('active');

          // Animation
          $element.addClass('in');
          $element.removeClass('out');
        }
      }

      function hideLoading() {
        if ($element[0]) {
          // Animation
          $element.addClass('out');
          $element.removeClass('in');

          timer = $timeout(function () {
            $element.removeClass('active');
          }, 500);
        }
      }


      scope.$on('ajaxLoading.show', function () {
        showLoading();
      });

      scope.$on('ajaxLoading.hide', function () {
        hideLoading();
      });

      scope.$on('ajaxLoading.clear', function () {
        count = 0;
        hideLoading();
      });

      scope.$on('cfpLoadingBar:loading', function (event, data) {
        if(/\.html$/.test(data.url)){
          return;
        }
        if (ajaxLoadingFactory.nextRequestLoader) {
          count++;
          showLoading();
        }
        ajaxLoadingFactory.nextRequestLoaderOptions({
          nextRequestLoader: true
        });
      });

      scope.$on('cfpLoadingBar:loaded', function () {
        count--;
        if (count <= 0) {
          count = 0;
          hideLoading();
        }
      });
    }
  };
});
export default module;
