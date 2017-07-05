import * as _ from 'lodash';
import angular from 'angular';
import userRoles from 'app/common/resources/roles.json';

let module = angular.module('app.provider', []);

module.config(
  ($locationProvider,
   $urlRouterProvider,
   $httpProvider,
   // paginationTemplateProvider,
   // $breadcrumbProvider,
   cfpLoadingBarProvider,
   $stateProvider,
   $provide,
   uibDatepickerConfig,
   $logProvider) => {
    'ngInject';

    $logProvider.debugEnabled(true);

    // Setup datepicker config
    uibDatepickerConfig.showWeeks = false;
    uibDatepickerConfig.formatYear = 'yyyy';
    uibDatepickerConfig.startingDay = 1;

    //Enable cross domain calls
    $httpProvider.defaults.useXDomain = true;
    //$httpProvider.defaults.headers.Origin = 'null';

    // // Pagination template config
    // paginationTemplateProvider.setPath('javascripts/app/common/templates/dirPagination.tpl.html');

    // $breadcrumbProvider.setOptions({
    //   prefixStateName: 'app.home',
    //   templateUrl: 'javascripts/app/common/templates/breadcrumbs.html'
    // });

    // Loading bar
    cfpLoadingBarProvider.includeSpinner = false;
    cfpLoadingBarProvider.includeBar = false;

    // Custom $stateProvider method
    $provide.decorator('$state', [
      '$delegate',
      '$rootScope',
      function ($delegate,
                $rootScope) {
        $rootScope.$on('$stateChangeStart', (event, state, params, fromState, fromParams) => {
          $delegate.next = state;
          $delegate.toParams = params;
          $delegate.previous = fromState;
          $delegate.fromParams = fromParams;
          if (!fromState.name && (!angular.isDefined(state.authorization) || state.authorization) && !$rootScope.saveState) {
            $rootScope.saveState = {
              state: state,
              params: params
            };
          }
        });
        return $delegate;
      }]);

    $stateProvider.$state = function (name, options) {
      // Create object resolve for state
      options.resolve = options.resolve || {};
      let objResolve = {};

      // Insert dependency permission into each resolve to make sure it will resolve before.
      _.each(options.resolve, function (arr) {
        if (_.isFunction(arr)) {
          // Before: {resolveName: function(){}} -> After {resolveName: ['permission', function(){}}
          arr = ['permission', arr];
        } else {
          // Before: {resolveName: ['dep1', 'dep2', function(dep1, dep2){}]}
          // After: {resolveName: ['dep1', 'dep2','permission', function(dep1, dep2){}]}
          arr.splice(-1, 0, 'permission');
        }
      });

      if (options.ocLazyLoad && _.isArray(options.ocLazyLoad) && options.ocLazyLoad.length > 0) {
        _.forEach(options.ocLazyLoad, function (md) {
          objResolve[md.replace(/(-.)/g, function (x) {
            return x[1].toUpperCase()
          })] = ($q) => {
            'ngInject';
            let deferred = $q.defer();
            window.OCLAZYLOAD[md](() => deferred.resolve());
            return deferred.promise;
          };
        });
      }



      objResolve.permissionLazyLoading = ($q, $ocLazyLoad) => {
        'ngInject';
        let deferred = $q.defer();
        require.ensure([
          'app/common/services/permission'
        ], (require) => {
          // Load file into app
          let permissionFactory = require('app/common/services/permission');
          // inject module
          $ocLazyLoad.load([
            {name: permissionFactory.default.name}
          ]);

          deferred.resolve();
        });
        return deferred.promise;
      };
      objResolve.permission = (userContext,
                               $q,
                               accountFactory,
                               $state,
                               $rootScope,
                               $location) => {
        'ngInject';

        var auth = userContext.authentication();
        var user = auth.userData;

        var deferred = $q.defer();
        if (options.permission && !accountFactory.checkRole(options.permission)) {
          // user have no permission to access
          userContext.clearInfo();
          $location.path('/page/signin');
        } else {
          deferred.resolve();
        }
        return deferred.promise;
      };

      _.extend(objResolve, options.resolve);
      options.resolve = objResolve;
      return $stateProvider.state(name, options);
    };

    // Authorization header
    $httpProvider.interceptors.push((userContext) => {
      'ngInject';
      return {
        request: function (config) {
          if (config.url && /\/token$/.test(config.url)) {
            return config;
          }

          if (!angular.isDefined(config.disableAuthorization) || config.disableAuthorization === false) {
            config.headers["Authorization"] = 'Bearer ' + userContext.authentication().token; //TODO: hardcode for test
            // config.headers["Authorization"] = 'Bearer ' + "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1laWQiOiIwMjQwNTA1NC1kZDgwLTQ5NzctYTdkMS0zMGRkYTgyYTY2YWMiLCJ1bmlxdWVfbmFtZSI6ImtoYW5oLnZ1QG5ld29jZWFuaW5mb3N5cy5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2FjY2Vzc2NvbnRyb2xzZXJ2aWNlLzIwMTAvMDcvY2xhaW1zL2lkZW50aXR5cHJvdmlkZXIiOiJBU1AuTkVUIElkZW50aXR5IiwiQXNwTmV0LklkZW50aXR5LlNlY3VyaXR5U3RhbXAiOiI2NzkzOTMyNy02YjA1LTQ3NTgtYmQyZS1lZTdjZGUwMTQ1MWUiLCJVc2VySWQiOiIwMjQwNTA1NC1kZDgwLTQ5NzctYTdkMS0zMGRkYTgyYTY2YWMiLCJGaXJzdE5hbWUiOiJLaGFuaCIsIkxhc3ROYW1lIjoiVnUiLCJFbWFpbCI6ImtoYW5oLnZ1QG5ld29jZWFuaW5mb3N5cy5jb20iLCJVc2VybmFtZSI6ImtoYW5oLnZ1QG5ld29jZWFuaW5mb3N5cy5jb20iLCJBcHBJZCI6ImI2ODFlNDRiLTc2MTItNGMwMi04YmNkLTY5ZTRiODc0ZjRlMSIsIkNsaWVudElkIjoiYjY4MWU0NGItNzYxMi00YzAyLThiY2QtNjllNGI4NzRmNGUxIiwiaXNzIjoiSW5zaWdodHVzIEFNUyIsImF1ZCI6ImI2ODFlNDRiLTc2MTItNGMwMi04YmNkLTY5ZTRiODc0ZjRlMSIsImV4cCI6MTQ4NDI5Nzg4NywibmJmIjoxNDg0MjExNDg3fQ.is0d5MNYWd1wJSoQnpxUUWm9oG4R6HXBbsijNgBfBvI";
          }
          return config;
        }
      }
    });

    // Error handler
    $httpProvider.interceptors.push(($q,
                                     toaster,
                                     appConstant,
                                     userContext,
                                     $injector) => {
      'ngInject';
      return {
        response: function (response) {
          let defer = $q.defer();
          if (angular.isObject(response.data) && angular.isDefined(response.data["message"]) && angular.isDefined(response.data.status) && !response.data.status) {
            if (!angular.isDefined(response.config.autoAlert) || response.config.autoAlert !== false) {
              toaster.pop('error', "Error", response.data.message);
            }
            defer.reject(response);
          }
          else if (angular.isObject(response.data) && !response.data.status && response.data.errorMessages && response.data.errorMessages.length) {
            let errorMessage = "";
            if (response.data.errorMessages.length > 1) {
              _.each(response.data.errorMessages, function (err) {
                errorMessage += "- " + err + "<br/>";
              });
            } else {
              _.each(response.data.errorMessages, function (err) {
                errorMessage += err;
              });
            }

            if (!angular.isDefined(response.config.autoAlert) || response.config.autoAlert !== false) {
              toaster.pop({
                type: 'error',
                title: 'Error',
                body: errorMessage,
                bodyOutputType: 'trustedHtml'
              });
            }

            defer.reject(response);
          }
          else {
            if (angular.isObject(response.config) && response.config.url.indexOf(appConstant.domain) > -1 && response.config.autoAlert) {
              toaster.pop('success', 'Success', response.data.message);
            } else {
              if (response.config.config && response.config.config.message) {
                toaster.pop('success', response.config.config.message);
              }
            }
            defer.resolve(response);
          }

          return defer.promise;
        },
        responseError: function (response) {
          let inflightAuthRequest = null;
          if (angular.isObject(response) && response.config && (response.config.url.indexOf(appConstant.domain) > -1)) {
            let refreshToken = userContext.authentication().refresh_token;
            if (response.status === 401 && refreshToken) {
              //toaster.pop('error', "Permission denied", "You have no permission to access this. Please contact your administrator");
              let deferred = $q.defer();
              if (!inflightAuthRequest) {
                inflightAuthRequest = $injector.get("$http").post(appConstant.domain + '/token', "grant_type=refresh_token&refresh_token=" + refreshToken + "&client_id=" + appConstant.app.client_id + "&client_secret=" + appConstant.app.client_secret, {
                  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                });
              }
              inflightAuthRequest.then(function (r) {
                inflightAuthRequest = null;
                if (r.data && r.data.access_token && r.data.refresh_token && r.data.expires_in) {
                  userContext.setToken(r.data.access_token, r.data.refresh_token, true);
                  $injector.get("$http")(response.config).then(function (resp) {
                    deferred.resolve(resp);
                  }, function (err) {
                    deferred.reject();
                  });
                } else {
                  deferred.reject();
                }
              }, function (er) {
                inflightAuthRequest = null;
                deferred.reject();
                userContext.clearInfo();
                $injector.get("ajaxLoadingFactory").clear();
                $injector.get("$state").go('page.signin');
              });
              return deferred.promise;

              // userContext.clearInfo();
              // $injector.get("$state").go('page.signin');
            }
            if (response.status === 400) {
              if (response.data && response.data.errorMessage) {
                toaster.pop('error', "Error", response.data.errorMessage);
              }
            }
          }

          return $q.reject(response);
        }
      }
    });

    //Remove the header used to identify ajax call  that would prevent CORS from working
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // Default route configuration
    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });

    // Default route
    $urlRouterProvider.otherwise("/app/home");
  }
);
export default module;
