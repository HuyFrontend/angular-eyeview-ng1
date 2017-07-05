import angular from "angular";
import tpl from './templates/topAlert.html';

let module = angular.module('common.directives.topAlert', []);

module.factory('topAlertFactory', ($rootScope) => {
  'ngInject';
  var services = {};

  function _show(template, alertClass, compile, scope) {
    $rootScope.$broadcast('$topAlert.showMessage', {
      template: template || '',
      alertClass: alertClass || '',
      compile: compile || false,
      scope: scope
    });
  }

  function _hide() {
    $rootScope.$broadcast('$topAlert.hideMessage');
  }

  services.show = _show;
  services.hide = _hide;

  return services;
});

module.directive('topAlert', ($timeout,
                              $compile,
                              $rootScope) => {
  'ngInject';
  return {
    restrict: 'E',
    bindToController: true,
    templateUrl: tpl,
    controllerAs: 'vm',
    controller: [
      '$scope',
      function ($scope) {
        var vm = this;
      }],
    /**
     *
     * @param scope
     * @param elem
     * @param attrs
     */
    link: function (scope, elem, attrs) {
      var $container = angular.element(elem.children()[0]);
      var $body = angular.element(document.body);
      var $scope;
      scope.$on('$topAlert.showMessage', function (e, data) {
        // Destroy old scope
        if ($scope) {
          $scope.$destroy();
        }

        // Clear template
        $container.html('');

        // Add class to body
        $body.addClass('has-top-alert');

        // Reset class to default
        $container.removeClass();
        $container.addClass('top-alert alert');

        // Then add custom class
        if (data.alertClass) {
          $container.addClass(data.alertClass);
        }

        // Create new scope
        $scope = $rootScope.$new();
        angular.extend($scope, data.scope);
        var $html = angular.copy(data.template);
        if (data.compile) {
          $timeout(function () {
            $html = $compile($html)($scope);
            $container.append($html);
          })
        } else {
          $container.append($html);
        }
      });

      scope.$on('$topAlert.hideMessage', function () {
        if ($scope) {
          $scope.$destroy();
        }

        // Clear template
        $container.html('');

        // Remove class
        $body.removeClass('has-top-alert');
        $container.removeClass();
      });

      scope.$emit('$topAlert.loaded');
    }
  };
});
export default module;
