import angular from 'angular';
import ROLE from'app/common/resources/roles.json';

let directive = ($location,
                 $stateParams,
                 userContext,
                 notifications,
                 $rootScope) => {
  'ngInject';

  function linkFn(scope, element) {
    function hideAlert() {
      element.hide();

      // remove class to body
      angular.element(document.body).removeClass('has-top-alert');
    }

    function validate() {
      if ((userContext.getPermissions() === ROLE.SUPER_ADMINISTRATOR) &&
        !$rootScope.currentUserInfo.isConfigChargify && $rootScope.currentUserInfo.isEnableChargify) {
        // add class to body
        angular.element(document.body).addClass('has-top-alert');
        element.show();
      } else {
        hideAlert();
      }
    }

    scope.closeAlert = function () {
      hideAlert();
    };

    notifications.onLogoutSuccess(function () {
      hideAlert();
    });

    notifications.onLibraryChanged(scope, validate);

    validate();
  }

  return {
    restrict: 'A',
    link: linkFn
  };
};
export default directive;
