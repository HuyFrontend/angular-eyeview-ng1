import angular from 'angular';
import controller from './controllers/signin';
import template from './templates/signin.html';
let module = angular.module('app.signin', []);

module.controller('SignInController', controller);

module.config(($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('page.signin', {
        url: '/signin',
        templateUrl: template,
        controller: 'SignInController',
        authorization: false,
        controllerAs: 'vm',
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
        },
        classes: ['login_page2']
      });
  }
);

export default module;
