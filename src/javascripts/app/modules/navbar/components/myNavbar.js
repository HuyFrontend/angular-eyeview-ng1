import angular from "angular";
import userRolesJson from "app/common/resources/roles.json";
import jobStatus from "app/common/resources/jobStatus.json";
import importDataStatus from "app/common/resources/importDataStatus.json";

let ROLE = angular.fromJson(userRolesJson);

let controller = function (accountFactory,
                           $state,
                           $rootScope,
                           userContext,
                           topAlertFactory,
                           confirmationFactory,
                           $scope,
                           notifications,
                           toaster,
                           $window,
                           $location) {
  'ngInject';
  var vm = this;
  var roles = userContext.getPermissions(); // Array {roleId, roleName}

  function signout() {
    accountFactory.logout().then(function (resp) {
      $state.transitionTo('page.signin');
    }, function () {
      $state.transitionTo('page.signin');
    }).finally(function () {
      notifications.logoutSuccess();
    });
  }

  function isInsightusAdministrator() {
    return roles && angular.isDefined(_.find(roles, {roleName: ROLE.INSIGHTUS_ADMINISTRATOR}));
  }





  vm.info = userContext.authentication();
  vm.JOB_STATUS = angular.fromJson(jobStatus);
  vm.importDataStatus = angular.fromJson(importDataStatus);
  vm.signout = signout;
  vm.isInsightusAdministrator = isInsightusAdministrator;
  vm.scrollOptions = {
    theme: 'minimal-dark',
    scrollbarPosition: 'outside',
    axis: "y"
  };


}
let Component = {
  templateUrl: require('app/modules/navbar/templates/navbar.html'),
  controller: controller,
  controllerAs: 'vm',
  bindToController: true
};

export default Component;

