import angular from "angular";
import controller from "./controllers/main";
import importDataStatusJson from "app/common/resources/importDataStatus.json";
import JOB_STATUS from "app/common/resources/jobStatus.json";

let module = angular.module('app.main', []);
module.controller('MainController', controller);
module.config(
  ($stateProvider) => {
    'ngInject';
    $stateProvider
      .$state('app', {
        url: '/app',
        templateUrl: require('app/modules/main/templates/main.html'),
        controller: 'MainController',
        controllerAs: 'vm',
        abstract: true,
        ocLazyLoad: ['moment'],
        resolve: {
          lazyLoad: ($q, $ocLazyLoad) => {
            'ngInject';
            let deferred = $q.defer();
            require.ensure([
              'app/common/directives/uploadProgress/uploadProgress',
              'app/common/services/account',
              'app/common/context/index',
              'app/common/directives/windows/windows',
              'app/common/directives/countdown',
              'app/common/components/overlayLoader'
            ], (require) => {
              // Load file into app
              let accountFactory = require('app/common/services/account');
              let uploadProgressFactory = require('app/common/directives/uploadProgress/uploadProgress');
              let userContext = require('app/common/context/index');
              let windowsService = require('app/common/directives/windows/windows');
              let countdown = require('app/common/directives/countdown');
              let overlayLoaderComponent = require('app/common/components/overlayLoader');

              // inject module
              $ocLazyLoad.load([
                {name: uploadProgressFactory.default.name},
                {name: accountFactory.default.name},
                {name: userContext.default.name},
                {name: windowsService.default.name},

                {name: overlayLoaderComponent.default.name},
                {name: countdown.default.name}
              ]);
              deferred.resolve();
            });
            return deferred.promise;
          },
          userInfo: (lazyLoad,
                     accountFactory,
                     userContext,
                     $q,
                     $location,
                     $state,
                     $rootScope,
                     SocketIOService,
                     $log ) => {
            'ngInject';
            let deferred = $q.defer();
            $log.debug('Resoling userInfo 1');



            SocketIOService.subscribe()
              .then(() => {

                if ($state.previous && $state.previous.name === "page.signin") {
                  $rootScope.saveState = null
                  //if currentUser is SuperAdministrator then not join group
                  // if (!$rootScope.currentUserInfo.roles[0]==="SuperAdministrator") {
                  //   // debugger;
                  //   // SocketIOService.socket && SocketIOService.socket.emit('server_join');
                  // }
                  SocketIOService.socket && SocketIOService.socket.emit('server_join',{});
                  $rootScope.saveState = null;
                  deferred.resolve();
                }
                else {

                  accountFactory.updateUserInfo()
                    .then(() => {
                      SocketIOService.socket && SocketIOService.socket.emit('server_join',{
                      });
                      $rootScope.saveState = null;
                      deferred.resolve();
                      // //if currentUser is SuperAdministrator then not join group
                      // if (!$rootScope.currentUserInfo.roles[0]==="SuperAdministrator") {
                      //   debugger;
                      //   // Finally start connect and invoke methods
                      //   SocketIOService.socket && SocketIOService.socket.emit('server_join');
                      //   $rootScope.saveState = null;
                      //
                      //   deferred.resolve();
                      // }
                      // else if ($rootScope.currentUserInfo.roles[0]==="SuperAdministrator" && $state.next.name === 'app.map') {
                      //   debugger;
                      //   //$state.go('app.hardware.manage');
                      //   deferred.reject();
                      // }
                      // else {
                      //   debugger;
                      //   $rootScope.saveState = null;
                      //   deferred.resolve();
                      // }
                    }, (err) => {
                      debugger;
                      $state.go('page.signin');
                      deferred.reject();
                    });
                }
              });

           // deferred.resolve();


            return deferred.promise;
          },

          prevState: (userContext, $state, $q) => {
            'ngInject';
            let deferred = $q.defer();
            let prevSt = userContext.prevState();
            if (prevSt) {
              $state.transitionTo(prevSt.state.name, prevSt.params);
            } else {
              deferred.resolve();
            }
            return deferred.promise;
          },
          wizardStatus: (userInfo, userContext, $state, $q, $rootScope) => {
            'ngInject';
            let deferred = $q.defer();
            let status = userContext.wizardOperatorNavigationStatus();
            if (status) {
              $state.transitionTo('app.wizard', {operatorId: $rootScope.userOperator.operatorId});
            } else {
              deferred.resolve();
            }
            return deferred.promise;
          },


        }
      });
  }
);
export default module;
