import angular from "angular";
// import ngFileUpload from "ng-file-upload";

let module = angular.module('common.services.account', []);

module.factory('accountFactory', ($http,
                                  appConstant,
                                  userContext,
                                  $q,
                                  $rootScope,
                                  notifications,
                                  $state,
                                  $log,
                                  $cookies) => {
  'ngInject';
  var services = {};

  services.login = function (email,password) {
    let $this = this;
    let deferred = $q.defer();
    let requestPayload = {
      'username': email,
      'password': password,
      'grant_type': 'password',
      'client_id': appConstant.app.client_id,
      'client_secret': appConstant.app.client_secret,
    };

    function transformRequestHandler(obj) {
      let str = [];
      _.each(_.keys(obj), function (p) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      });
      return str.join("&");
    }

    let config = {
      method: 'POST',
      url: appConstant.domain + '/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
      },
      transformRequest: transformRequestHandler,
      data: requestPayload,
      disableAuthorization: true
    };

    let success = (resp) => {
      if (resp.data) {
        // Save access token and refresh token
        userContext.setToken(resp.data.access_token, resp.data.refresh_token, true);
        userContext.setLocalToken(resp.data.access_token, true);

        $this.updateUserInfo().
          then(function () {
            notifications.loginSuccess();
            deferred.resolve();},
          function (err) {
            deferred.reject();});
      } else {
        deferred.reject();
      }
    };

    let error = (err) => {
      deferred.reject(err);
    };

    $http(config)
      .then(success, error);
    return deferred.promise;
  };
  services.refreshToken = function (forceUpdate) {
    var $this = this;
    var deferred = $q.defer();
    var requestPayload = {
      "refresh_token": userContext.authentication().refresh_token,
      "grant_type": "refresh_token",
      "client_id": appConstant.app.client_id,
      client_secret: appConstant.app.client_secret
    };

    function transformRequestHandler(obj) {
      var str = [];
      _.each(_.keys(obj), function (p) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      });
      return str.join("&");
    }

    $http({
      method: 'POST',
      url: appConstant.domain + '/token',
      headers: {
        //'Authorization': 'Basic ' + appConstant.encryptKey,
        "Content-Type": 'application/x-www-form-urlencoded; charset=utf-8'
      },
      transformRequest: transformRequestHandler,
      data: requestPayload
    })
      .then(function (resp) {
        if (resp.data) {
          // Save access token and refresh token
          userContext.setToken(resp.data.access_token, resp.data.refresh_token, true);
          userContext.setLocalToken(resp.data.access_token, true);

          $this.updateUserInfo(forceUpdate).then(function () {
            notifications.loginSuccess();
            deferred.resolve();
            },
            function (err) {
              deferred.reject();
          });
        } else {
          deferred.reject();
        }
      }, function (err) {
        deferred.reject(err);
      });
    return deferred.promise;
  };

  services.logout = function () {
    var deferred = $q.defer();
    userContext.clearInfo();
    deferred.resolve();
    return deferred.promise;
  };

  services.updateUserInfo = function (forceUpdate) {
    var deferred = $q.defer();
    this.getUserInfo().success(function (userInfo) {

      // this code use for test
      // let userInfo = {"username":"lam14@mailinator.com","email":"lam14@mailinator.com","firstName":"l14","lastName":"h","gmtTimeZone":1,"currentOperator":{"operatorId":"e27176b4-a657-4127-b93f-57d6ea73809c","operatorName":"l14","carrierName":null,"roleInOperator":"OperatorOwner","bandName":null,"dataImportStatus":0,"finishChargifyStep":false,"mijiTemplateUrl":null,"utiTemplateUrl":null},"isSuperAdministrator":false,"avatarUrl":null};
      let permissions = userInfo && userInfo.roles || null;
      if (userInfo.roles.length>0) {
        permissions = userInfo.roles;
      }

      // Seperate permission from user info
      delete userInfo.permissions;

      // save user info to localstorage
      userContext.fillInfo(userInfo, true);
      userContext.updatePermissions(permissions);

      deferred.resolve();
    }).error(function (err) {
      deferred.reject();
    });

    return deferred.promise;
  };

  services.getUserInfo = function () {
    return $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/account/userinfo', {
      hideErrorMessage: true
    });
  };



  // return true if have permission
  services.checkRole = function (roles) {
    var userRolesInfo = userContext.getPermissions() || [];
    $log.debug(userRolesInfo);
    return _.intersection(userRolesInfo, roles).length || _.intersection(userRolesInfo, _.map(roles, 'name')).length;
  };
  services.transitionToHome = function () {
    if ($rootScope.saveState) {
      $state.transitionTo($rootScope.saveState.state.name, $rootScope.saveState.params);
    } else {
      // Check status importing data before transition, if not import yet: go to wizard/create, else go to app/map
      $state.transitionTo('app.home');
    }
  };

  /**
   * Read token from cookies -> Set Token back -> Refresh user data
   */
  services.readTokenFromCookiesAndReloadData = function () {
    let deferred = $q.defer();

    $log.debug('register result AMSToken', $cookies.get('AMSToken'));
    $log.debug('register result AMSRefreshToken', $cookies.get('AMSRefreshToken'));

    let flag = $cookies.get('AMSToken') && $cookies.get('AMSRefreshToken');
    if (flag) {
      // Save access token and refresh token
      userContext.setToken($cookies.get('AMSToken'), $cookies.get('AMSRefreshToken'), true);

      // Clear token in cookies
      $cookies.remove('AMSToken');

      $cookies.remove('AMSRefreshToken');
      $log.debug('register result update user info');
      services.updateUserInfo(true).then(
        function () {deferred.resolve();  },
        function () {deferred.reject(); });

    } else {
      deferred.reject();
    }
    return deferred.promise;
  };



  services.forgotPassword = function (email) {
    return $http.post(appConstant.domain + '/api/' + appConstant.apiVersion + '/account/password/forgot', {
      email: email
    }, {
      headers: {
        'Authorization': 'Basic ' + appConstant.app.basicode
      },
      "disableAuthorization": true,
      "autoAlert": false
    });
  };

  services.resetPassword = function (model) {
    return $http.put(appConstant.domain + '/api/' + appConstant.apiVersion + '/account/password/reset/confirm', model, {
      headers: {
        'Authorization': 'Basic ' + appConstant.app.basicode
      },
      "disableAuthorization": true,
      "autoAlert": false
    });
  };

  services.changePassword = function (model) {
    return $http.put(appConstant.domain + '/api/' + appConstant.apiVersion + '/account/password/change', model, {
      headers: {
        'Authorization': 'Basic ' + appConstant.app.basicode
      },
    });
  };
  return services;
});
export default module;
