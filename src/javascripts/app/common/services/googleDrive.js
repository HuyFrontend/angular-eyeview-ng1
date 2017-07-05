import angular from 'angular';

let module = angular.module('common.services.googleDrive', []);

module.factory('googleDriveFactory', (appConstant,
                                      $q,
                                      localStorageService,
                                      $http,
                                      utilFactory) => {
    'ngInject';
    var service = {},
      isAuthorized = false,
      isLogged = false,
      token = null;

    function loadAuth() {
      var authData = localStorageService.get('GoogleDriveAuthentication');
      isAuthorized = authData ? authData.isAuthorized : false;
      token = authData ? authData.token : null;
    }

    service.isAuth = function () {
      loadAuth();
      return isAuthorized;
    };

    service.clearAuth = function () {
      isAuthorized = false;
      isLogged = false;
      token = null;
      localStorageService.set('GoogleDriveAuthentication', null);
    };

    service.validateToken = function () {
      var deferred = $q.defer();
      loadAuth();

      if (isAuthorized && token) {
        $http.get('https://www.googleapis.com/oauth2/v1/tokeninfo', {
          params: {
            access_token: token
          }
        })
          .success(function (resp) {
            if (angular.isDefined(resp.expires_in)) {
              deferred.resolve();
            } else {
              isAuthorized = false;
              isLogged = false;
              token = null;
              deferred.reject();
            }
          })
          .error(function (err) {
            console.log(err);
            isAuthorized = false;
            isLogged = false;
            token = null;
            deferred.reject();
          });
      }
      else {
        isAuthorized = false;
        isLogged = false;
        token = null;
        deferred.reject();
      }
      return deferred.promise;
    };

    service.authorize = function () {
      var deferred = $q.defer();

      function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
          // Hide auth UI, then load client library.
          isAuthorized = true;
          isLogged = true;
          token = authResult.access_token;
          localStorageService.set('GoogleDriveAuthentication', {
            isAuthorized: isAuthorized,
            token: token
          });
          deferred.resolve();
        } else {
          // Show auth UI, allowing the user to initiate authorization by
          // clicking authorize button.
          deferred.reject();
        }
      }

      if (!isLogged) {
        gapi.auth.authorize(
          {
            client_id: appConstant.googleDriveClientId,
            scope: appConstant.googleDriveScope,
            immediate: isAuthorized
          },
          handleAuthResult);
      }
      else {
        deferred.resolve();
      }

      return deferred.promise;
    };

    service.loadFiles = function (q, nextPageToken) {
      var deferred = $q.defer();

      function listFiles() {
        var payload = {
          'maxResults': 10
        };

        if (nextPageToken) {
          payload.pageToken = nextPageToken;
        }

        if (q) {
          payload.q = q;
        }

        payload.access_token = token;

        $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/external/file/googledrive', {
          params: payload
        })
          .success(function (resp) {
            deferred.resolve({
              files: resp.data.items,
              isMore: angular.isDefined(resp.data.nextLink),
              nextPageToken: resp.data.nextPageToken
            });
          })
          .error(function (err) {
            deferred.reject(err);
          });

        //var request = gapi.client.drive.files.list(payload);
        //
        //request.execute(function(resp) {
        //  nextPageToken = resp.nextPageToken;
        //  deferred.resolve(resp.items);
        //});
      }

      service.authorize()
        .then(function () {
          gapi.client.load('drive', 'v2', listFiles);
        }, function () {
          isAuthorized = false;
          isLogged = false;
          token = '';
          localStorageService.set('GoogleDriveAuthentication', {
            isAuthorized: isAuthorized,
            token: token
          });
          deferred.reject();
        });
      return deferred.promise;
    };

    service.downloadFile = function (url, fileName) {
      var downloadUrl = url;
      if (url.indexOf('?') > -1) {
        downloadUrl = downloadUrl + '&access_token=' + token;
      }
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

    service.getRootFolderId = function () {
      var deferred = $q.defer();
      $http.get('https://www.googleapis.com/drive/v2/about', {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      }).then(function (resp) {
        deferred.resolve(resp.data);
      }, function (error) {
        if (error.status === 401) {
          // Clear authorized status
          service.clearAuth();

          // Re-Authorize
          service.authorize()
            .then(function () {
              // Try to get root folder id again
              service.getRootFolderId()
                .then(function (rr) {
                  deferred.resolve(rr);
                }, function (err) {
                  console.log(err);
                  // Clear authorized status
                  service.clearAuth();
                  deferred.reject();
                });
            });
        }
      });
      return deferred.promise;
    };

    service.getFileDetails = function (fileId) {
      loadAuth();
      return $http.get('https://www.googleapis.com/drive/v2/files/' + fileId, {
        params: {
          'access_token': token
        }
      });
    };

    return service;
  }
);
export default module;
