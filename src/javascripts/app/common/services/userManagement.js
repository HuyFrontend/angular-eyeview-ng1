import angular from 'angular';

let module = angular.module('common.services.userManagement', []);

module.factory('userManagementFactory', ($http,
                                         appConstant,
                                         $rootScope) => {
  'ngInject';
  var services = {};

  services.getListUsers = function (params, ignoreLoadingBar) {

    return $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/account/'  + params.take + '/' + params.skip, {
      ignoreLoadingBar: ignoreLoadingBar
    });
  };


  services.inviteUser = function ( model) {
    return $http.post(appConstant.domain + '/api/' + appConstant.apiVersion + '/account', model, {
      autoAlert: true
    });
  };


  /**
   * Remove user by userId
   * @param userId
   * @param operatorId
   * @returns {HttpPromise}
   */
  services.removeUser = function (userId, operatorId) {
    operatorId = operatorId || $rootScope.userOperator.operatorId;
    return $http.delete(appConstant.domain + '/api/' + appConstant.apiVersion + '/users/' + operatorId + '/user/' + userId, {}, {
      autoAlert: false
    });
  };

  /**
   * Change role of user
   * @param userId
   * @param model
   * @param operatorId
   * @returns {HttpPromise}
   */
  services.changeRole = function (userId, model) {
    return $http.put(appConstant.domain + '/api/' + appConstant.apiVersion + '/account/' + '/user/' + userId+'/changerole', model, {
      autoAlert: true
    });
  };


  return services;
});
export default module;
