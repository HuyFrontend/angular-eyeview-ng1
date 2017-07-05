import angular from 'angular';
import controller from './controllers/changePassword';

let module = angular.module('app.changePassword', []);

module.controller('ChangePasswordController', controller);

module.config(($stateProvider) => {
  'ngInject';
  $stateProvider
    .$state('app.changePassword', {
      page_title: 'Change Password',
      ncyBreadcrumb: {
        label: 'Change Password'
      },
      url: '/change-password',
      views: {
        'main': {
          templateUrl: require("app/modules/changePassword/templates/changePassword.html"),
          controller: 'ChangePasswordController',
          controllerAs: 'vm',
          needChargify: true
        }
      },
      authorization: true,
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
