import angular from 'angular';

let module = angular.module('common.services.dropBox', []);

module.factory('dropBoxFactory', (appConstant,
                                  $q,
                                  $http,
                                  localStorageService,
                                  utilFactory) => {
    'ngInject';
    var service = {},
      token,
      clientId = appConstant.dropBoxClientId,
      returnUrl = encodeURIComponent('http://' + window.location.host);

    function loadAuthData() {
      var authData = localStorageService.get('DropBoxAuthentication');
      if (authData) {
        token = authData.access_token;
      }
    }

    service.isAuth = function () {
      loadAuthData();
      return angular.isDefined(token);
    };

    service.revoke = function () {
      loadAuthData();
      if (token) {
        $http.post('https://api.dropboxapi.com/1/disable_access_token', null, {
          headers: {
            "Authorization": "Bearer " + token
          }
        });
      }
    };

    service.authorize = function () {
      var deferred = $q.defer();
      loadAuthData();

      if (token) {
        deferred.resolve();
        return deferred.promise;
      }

      function OauthReturn(e, a) {
        window.removeEventListener('OauthReturn', OauthReturn);
        token = e.detail.access_token;
        localStorageService.set('DropBoxAuthentication', {access_token: token});
        deferred.resolve();
      }

      window.open('https://www.dropbox.com/1/oauth2/authorize?response_type=token&client_id=' + clientId + '&redirect_uri=' + returnUrl, 'DropBox Authentication', 'height=500,width=500');
      window.addEventListener('OauthReturn', OauthReturn);
      return deferred.promise;
    };

    service.loadData = function (path, take) {
      var deferred = $q.defer();
      service.authorize()
        .then(function () {
          $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/external/file/dropbox', {
            params: {
              file_limit: take,
              path: encodeURIComponent(path),
              access_token: token
            }
          })
            .success(function (resp) {
              deferred.resolve(resp.data);
            })
            .error(function (err) {
              deferred.reject(err);
            });
        });
      return deferred.promise;
    };

    service.downloadFile = function (url, fileName) {
      var downloadUrl = url;
      downloadUrl = downloadUrl + '?access_token=' + token;
      return $http.post(appConstant.domain + '/api/' + appConstant.apiVersion + '/upload/external', {
        uuid: utilFactory.newGuid(),
        fileName: fileName,
        url: downloadUrl
      }, {
        headers: {
          'content-type': 'application/json'
        }
      });
    };

    return service;
  }
);
export default module;
