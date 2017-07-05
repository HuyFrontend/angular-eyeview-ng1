import angular from 'angular';

let module = angular.module('common.services.box', []);

  // var module = angular.module('common.services.box', []);

  module.factory('boxFactory',
    (appConstant,
             $q,
             $http,
             localStorageService,
             utilFactory) => {
      'ngInject';

      var service = {};
      service.token = null;
      service.refreshToken = null;
      service.clientId = appConstant.boxClientId;
      service.clientSecret = appConstant.boxClientSecret;
      service.returnUrl = encodeURIComponent('http://' + window.location.host);

      function loadAuthData() {
        var authData = localStorageService.get('BoxAuthentication');
        if(authData) {
          service.token = authData.access_token;
          service.refreshToken = authData.refresh_token;
        }
      }

      service.isAuth = function() {
        loadAuthData();
        return service.token !== null;
      };

      service.revoke = function() {
        loadAuthData();
        if(service.token && service.refreshToken) {
          $http.post('https://api.box.com/oauth2/revoke', 'client_id=' + service.clientId + '&client_secret=' + service.clientSecret + '&token=' + service.token, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          });
        }
      };

      service.authorize = function() {
        var deferred = $q.defer();
        loadAuthData();

        if(service.token && service.refreshToken) {
          deferred.resolve();
          return deferred.promise;
        }

        window.open('https://app.box.com/api/oauth2/authorize?response_type=code&client_id=' + service.clientId + '&redirect_uri=' + service.returnUrl + '&state=onTarget', 'Box Authentication', 'height=500,width=500');

        function oauthReturn(e, a) {
          if(window.removeEventListener) {                   // For all major browsers, except IE 8 and earlier
            window.removeEventListener("OauthReturn", oauthReturn);
          } else if(window.detachEvent) {                    // For IE 8 and earlier versions
            window.detachEvent("OauthReturn", oauthReturn);
          }
          console.log(e);
          var code = e.detail.access_token;
          //var data = "grant_type=authorization_code&code=" + code + "&client_id=" + clientId + "&client_secret=" + clientSecret;
          var data = {
            "grant_type": "authorization_code",
            "code": code,
            "client_id": service.clientId,
            "client_secret": service.clientSecret
          };
          $http.post(appConstant.domain + '/api/'+appConstant.apiVersion+'/external/file/box/authorize', data)
            .success(function(resp) {
              //{
              //  "access_token": "debiQcKmrSetE8qrO4sBcLcdPbqotxWp",
              //  "expires_in": 4259,
              //  "restricted_to": [],
              //  "refresh_token": "XsFqvZM94ab9HfA3UKCbBstk8DnNVZvSrvRKefqN5TXCqNZwESCBcehtL5MBzRzY",
              //  "token_type": "bearer"
              //}
              console.log(resp);
              service.token = resp.data.access_token;
              service.refreshToken = resp.data.refresh_token;
              localStorageService.set('BoxAuthentication', {
                access_token: service.token,
                refresh_token: service.refreshToken
              });
              deferred.resolve();
            })
            .error(function(err) {
              console.log(err);
              deferred.reject();
            });
        }

        window.addEventListener('OauthReturn', oauthReturn);
        return deferred.promise;
      };

      service.refresh = function() {
        var deferred = $q.defer();
        //var formData = 'grant_type=refresh_token&refresh_token=' + refreshToken + '&client_id=' + clientId + '&client_secret=' + clientSecret;
        var formData = {
          "grant_type": "refresh_token",
          "refresh_token": service.refreshToken,
          "client_id": service.clientId,
          "client_secret": service.clientSecret
        };
        $http.post(appConstant.domain + '/api/'+appConstant.apiVersion+'/external/file/box/refresh', formData)
          .success(function(resp) {
            //{ "access_token": "T9cE5asGnuyYCCqIZFoWjFHvNbvVqHjl", "expires_in": 3600, "restricted_to": [], "token_type": "bearer", "refresh_token": "J7rxTiWOHMoSC1isKZKBZWizoRXjkQzig5C6jFgCVJ9bUnsUfGMinKBDLZWP9BgR" }
            service.token = resp.data.access_token;
            service.refreshToken = resp.data.refresh_token;
            localStorageService.set('BoxAuthentication', {
              access_token: service.token,
              refresh_token: service.refreshToken
            });
            deferred.resolve();
          })
          .error(function(err) {
            console.log(err);
            deferred.reject();
          });
        return deferred.promise;
      };

      service.loadData = function(folderId, from, take, df) {
        var deferred = $q.defer();
        service.authorize()
          .then(function() {
            //$http.get('https://api.box.com/2.0/folders/' + folderId + '/items', {
            //  params: {
            //    limit: take,
            //    offset: from
            //  },
            //  headers: {
            //    "Authorization": "Bearer " + token
            //  }
            //})
            $http.get(appConstant.domain + '/api/'+appConstant.apiVersion+'/external/file/box', {
                params: {
                  limit: take,
                  offset: from,
                  folderId: folderId,
                  access_token: service.token
                }//,
                //headers: {
                //  "Authorization": "Bearer " + token
                //}
              })
              .then(function(resp) {
                if(df) {
                  df.resolve(resp.data.data);
                } else {
                  deferred.resolve(resp.data.data);
                }
              }, function(err) {
                if(err.status === 401) {
                  service.refresh()
                    .then(function() {
                      service.loadData(folderId, from, take, deferred);
                    }, function() {
                      service.token = null;
                      service.refreshToken = null;
                      localStorageService.set('BoxAuthentication', null);
                      deferred.reject(err);
                    });
                }
              });
          });
        return deferred.promise;
      };

      service.downloadFile = function(url, fileName) {
        var downloadUrl = url;
        downloadUrl = downloadUrl + '?access_token=' + service.token;
        return $http.post(appConstant.domain + '/api/'+appConstant.apiVersion+'/upload/external', {
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
