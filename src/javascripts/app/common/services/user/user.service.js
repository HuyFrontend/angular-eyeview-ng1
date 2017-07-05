/*@ngInject*/
export default class UserService {
  constructor($http, appConstant, $rootScope) {
    let self = this;
    self._$http = $http;
    self._appConstant = appConstant;
    self._$rootScope = $rootScope;
  }

  getListUsers(params, ignoreLoadingBar) {
    let self = this;
    return self._$http.get(self._appConstant.domain + '/api/' + self._appConstant.apiVersion + '/account/' +  params.take + '/' + params.skip, {
      ignoreLoadingBar: ignoreLoadingBar
    });
  };

  inviteUser(model) {
    let self = this;
    return self._$http.post(self._appConstant.domain + '/api/' + self._appConstant.apiVersion + '/account', model, {
      autoAlert: true
    });
  };

  /**
   * Remove user by userId
   * @param userId
   * @param operatorId
   * @returns {HttpPromise}
   */
  removeUser(userId) {
    let self = this;

    return self._$http.delete(self._appConstant.domain + '/api/' + self._appConstant.apiVersion + '/account/' + userId, {}, {
      autoAlert: false
    });
  };

  /**
   * Change role of user
   * @param userId
   * @param model
   * @returns {HttpPromise}
   */
  changeRole(userId, model) {
    let self = this;

    return self._$http.put(self._appConstant.domain + '/api/' + self._appConstant.apiVersion + '/account/' + userId+'/changerole', model, {
      autoAlert: true
    });
  };


}
