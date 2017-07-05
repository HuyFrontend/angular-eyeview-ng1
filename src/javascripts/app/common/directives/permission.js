import angular from 'angular';

let module = angular.module('common.directives.permission', []);
module.directive('permission', (accountFactory,
                                notifications,
                                $rootScope) => {
  'ngInject';
  return function (scope, element, attrs) {

    function checkPermission() {
      if (attrs.permission.indexOf(',') > -1) {
        let permissions = attrs.permission.split(',');
        // Check if there is a role that current role not satify
        let flag = !_.filter(permissions, function (el) {
            return accountFactory.checkRole([el.trim()]);
          }).length;
        // let flag = accountFactory.checkRole(permissions);
        if (flag) {

          element.hide();
        } else {
          element.show();
        }
      }
      else {

        if (!accountFactory.checkRole([attrs.permission])) {
          element.hide();
        } else {
          element.show();
        }
      }
    }
    checkPermission();
  };
});
export default module;
