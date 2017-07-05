import angular from 'angular';
import controller from './controllers/page';
let module = angular.module('app.page', []);
module.controller('PageController', controller);

module.config(($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('page', {
        url: '/page',
        templateUrl: require('app/modules/page/templates/page.html'),
        controller: 'PageController',
        abstract: true,
        resolve: {
          authentication: ($rootScope,
                           $q,
                           $location,
                           toaster,
                           userContext,
                           accountFactory) => {
            'ngInject';
            var deferred = $q.defer();
            //if (angular.isObject($rootScope.currentUserInfo) && Object.keys($rootScope.currentUserInfo).length) {
            if (userContext.authentication().isAuth) {
              // Fix when create operator should reload user info
              toaster.pop({
                type: "info",
                body: "You are already signed in"
              });
              $location.path('/app/home');
            } else {
              deferred.resolve();
            }
            return deferred.promise;
          }
        }
      })
    ;
  }
);
export default module;
