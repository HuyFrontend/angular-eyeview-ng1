import angular from 'angular';

let module = angular.module('common.services.permission', []);

module.factory('permissionFactory', ($rootScope,
                                     userContext) => {
    'ngInject';
    var service = {};

    service.checkPermission = function (p) {
      var permissions = userContext.getPermissions();

      return permissions && permissions === p.trim();

    };

    return service;
  }
);

export default module;
