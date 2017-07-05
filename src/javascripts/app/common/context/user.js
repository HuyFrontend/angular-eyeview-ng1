import angular from "angular";

let module = angular.module('common.context.user', []);

module.factory('userContext',
  (localStorageService,
   $q,
   $rootScope) => {
    'ngInject';
    var service = {},
      userOperator = null,
      userOrganization = null,
      authentication = {
        isAuth: false,
        token: '',
        refresh_token: '',
        userData: {},
        // avatarId: (new Date()).getTime()
      },
      permissions = null;

    $rootScope.currentUserInfo = authentication.userData;

    service.getPermissions = function () {
      var data = localStorageService.get('permissionData') || permissions;
      permissions = data;
      return data;
    };

    service.updatePermissions = function (p) {
      permissions = p;
      localStorageService.set('permissionData', p);
    };

    service.getUserOperator = function () {
      var data = localStorageService.get('userOperator') || userOperator;
      return userOperator = data;
    };
    service.updateUserOperator = function (p) {
      userOperator = p;
      $rootScope.userOperator = userOperator;
      localStorageService.set('userOperator', p);
    };

    service.getUserOrganization = function () {
      var data = localStorageService.get('userOrganization') || userOrganization;
      userOrganization = data;

      return data;
    };

    service.updateUserOrganization = function (p) {
      userOrganization = p;
      $rootScope.userOrganization = userOrganization;
      localStorageService.set('userOrganization', p);
    };
    service.setToken = function (token, refresh_token, rememberMe) {
      if (!token) {
        authentication.isAuth = false;
        authentication.insightus_token = undefined;
        authentication.refresh_token = undefined;
        this.clearInfo();
      } else {
        authentication.isAuth = true;
        authentication.insightus_token = token;
        authentication.refresh_token = refresh_token;
      }
      authentication.token = authentication.insightus_token;
      if (rememberMe) {
        this.saveLocal(authentication);
      }
    };
    service.setLocalToken = function (token, rememberMe) {
      if (!token) {
        authentication.isAuth = false;
        authentication.token = undefined;
        this.clearInfo();
      } else {
        authentication.isAuth = true;
        authentication.token = token;
      }
      if (rememberMe) {
        this.saveLocal(authentication);
      }
    };

    service.fillInfo = function (obj, rememberMe) {
      authentication.userData = angular.extend(authentication.userData, obj);
      $rootScope.currentUserInfo = authentication.userData;

      // Save data to local storage
      if (rememberMe) {
        this.saveLocal(authentication);
      }
    };

    service.clearInfo = function () {
      authentication.userData = {};
      $rootScope.currentUserInfo = {};
      authentication.token = '';
      authentication.insightus_token = '';
      authentication.refresh_token = '';
      // authentication.avatarId = (new Date()).getTime();
      authentication.isAuth = false;
      this.updateUserOperator(null);
      this.updateUserOrganization(null);
      this.storeUserCoordinate(null);
      this.updatePermissions([]);
      this.saveLocal(authentication);
    };

    service.saveLocal = function (obj) {
      obj = obj || {};
      localStorageService.set('authenticationData', obj);
    };

    service.loadFromLocal = function () {
      var data = localStorageService.get('authenticationData');
      data = data || {};
      authentication = data;
      // authentication.avatarId = (new Date()).getTime();
      $rootScope.currentUserInfo = authentication.userData;
      $rootScope.userOperator = localStorageService.get('userOperator');
      $rootScope.userOrganization = localStorageService.get('userOrganization');
      this.setToken(data.token, data.refresh_token, true);
    };

    service.signOut = function () {
      var deferred = $q.defer();
      this.clearInfo();
      deferred.resolve();
      return deferred.promise;
    };

    service.authentication = function () {
      return authentication;
    };
    service.storeUserCoordinate = function (latLng) {
      localStorageService.set('userCoordinate', latLng);
    };
    service.getUserCoordinate = function () {
      return localStorageService.get('userCoordinate') || null;
    };
    service.auth = function () {
      return authentication;
    };

    service.prevState = function (state, stateParams) {
      if (!state || !stateParams) {
        let state = localStorageService.get('prevState');
        localStorageService.remove('prevState');
        return state;
      }
      localStorageService.set('prevState', {
        state: state,
        params: stateParams
      });
    };

    service.wizardOperatorNavigationStatus = function (stt) {
      if (angular.isDefined(stt)) {
        localStorageService.set('wizardOperatorNavigationStatus', stt);
      } else {
        stt = localStorageService.get('wizardOperatorNavigationStatus');
        localStorageService.remove('wizardOperatorNavigationStatus');
      }
      return stt;
    };

    service.localAppStateId = function (stateId, clearState) {
      let currentStateId = localStorageService.get('AppStateId');
      if (clearState) {
        localStorageService.remove('AppStateId');
      }
      if (!stateId) {
        return currentStateId;
      }
      localStorageService.set('AppStateId', stateId);
      return stateId;
    };
    return service;
  });
export default module;
