import angular from 'angular';
import controller from './controllers/resetPassword';
import template from './templates/resetPassword.html';

let module = angular.module('app.resetPassword', []);

module.controller('ResetPasswordController', controller);

module.config(
  ($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('page.resetPassword', {
        url: '/resetpassword/:userId/:code',
        templateUrl: template,
        controller: 'ResetPasswordController',
        authorization: false,
        controllerAs: 'vm',
        classes: ['login_page2'],
        resolve: {
          lazyLoad: ($q, $ocLazyLoad) => {
            'ngInject';
            let deferred = $q.defer();
            require.ensure([
              'app/common/services/account',
            ], (require) => {
              // Load file into app
              let accountFactory = require('app/common/services/account');
              // inject module
              $ocLazyLoad.load([
                {name: accountFactory.default.name},
              ]);
              deferred.resolve();
            });
            return deferred.promise;
          }

        }
      });
  }
);
export default module;
