import angular from 'angular';

let directive = ($location,
                 $stateParams,
                 $window,
                 $timeout,
                 notifications) => {
  'ngInject';
  function linkFn(scope, element) {

    function hideAlert() {
      // remove class to body
      angular.element(document.body).removeClass('has-top-alert');

      $timeout(function () {
        angular.element(window).trigger('resize');
      });

      // Remove element
      element.hide();
    }

    // remove changeRole queryString
    if ($stateParams.changeRole === "true") {
      $location.search('changeRole', null);

      // add class to body
      angular.element(document.body).addClass('has-top-alert');
    } else {
      // Remove elements
      element.hide();
    }

    scope.closeAlert = function () {
      hideAlert();
    };

    notifications.onLogoutSuccess(function () {
      hideAlert();
    });
  }

  return {
    restrict: 'A',
    link: linkFn
  };
};
export default directive;
