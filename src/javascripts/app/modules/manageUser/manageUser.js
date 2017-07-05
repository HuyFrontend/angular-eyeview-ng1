import angular from 'angular';
import controller from './controllers/manageUser';
import upgradeAccountMessageDirective from './directives/upgradeAccountMessage';
import upgradeAccountSuccessfulMessageDirective from './directives/upgradeAccountSuccessfulMessage';

let module = angular.module('app.manageUser', []);

module.controller('ManageUserController', controller);
module.directive('upgradeAccountMessage', upgradeAccountMessageDirective);
module.directive('upgradeAccountSuccessfulMessage', upgradeAccountSuccessfulMessageDirective);

module.config(($stateProvider) => {
  'ngInject';
  $stateProvider
    .$state('app.manageUser', {
      page_title: 'User Management',
      ncyBreadcrumb: {
        label: 'User Management'
      },
      url: '/users',
      views: {
        'main': {
          templateUrl: require("app/modules/manageUser/templates/manageUser.html"),
          controller: 'ManageUserController',
          controllerAs: 'vm',
          needChargify: true
        }
      },
      resolve: {
        lazyLoad: ($q, $ocLazyLoad)=> {
          'ngInject';
          let deferred = $q.defer();
          require.ensure([
            'app/common/services/util',
            'app/common/services/resource',
            'app/common/services/user/index'
          ], (require)=> {
            // Load file into app
            let resourceFactory = require('app/common/services/resource');
            let utilFactory = require('app/common/services/util');
            let userService = require('app/common/services/user/index');
            // inject module
            $ocLazyLoad.load([
              {name: utilFactory.default.name},
              {name: userService.default.name},
              {name: resourceFactory.default.name}
            ]);
            deferred.resolve();
          });
          return deferred.promise;
        },
      }
    });
});

export default module;
