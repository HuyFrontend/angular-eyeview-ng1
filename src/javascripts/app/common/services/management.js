import angular from 'angular';
let module = angular.module('common.services.management', []);
module.factory('managementFactory', ($http,
                                     appConstant) => {
  'ngInject';
  var services = {};

  /**
   * Get list libraries
   *@param params
   * @returns {HttpPromise}
   */
  function getListLibraries(params) {
    return $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/operator/all/' + params.take + '/' + params.skip);
  }

  /**
   * Delete a library
   * @param libraryId
   * @returns {HttpPromise}
   */
  function deleteLibrary(libraryId) {
    return $http.delete(appConstant.domain + '/api/' + appConstant.apiVersion + '/management/libraries/' + libraryId);
  }

  /**
   * Delete all libraries
   * @returns {HttpPromise}
   */
  function deleteAllLibrary() {
    return $http.delete(appConstant.domain + '/api/' + appConstant.apiVersion + '/management/libraries/clear');
  }

  /**
   * Get all Users
   * @returns {HttpPromise}
   */
  function getListUsers() {
    return $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/management/users');
  }

  /**
   * Delete user
   * @param userId
   * @returns {HttpPromise}
   */
  function deleteUser(userId) {
    return $http.delete(appConstant.domain + '/api/' + appConstant.apiVersion + '/management/users/' + userId);
  }

  /**
   * Delete All users
   * @returns {HttpPromise}
   */
  function deleteAllUsers() {
    return $http.delete(appConstant.domain + '/api/' + appConstant.apiVersion + '/management/users/clear');
  }


  services.getListLibraries = getListLibraries;
  services.deleteLibrary = deleteLibrary;
  services.deleteAllLibrary = deleteAllLibrary;
  services.getListUsers = getListUsers;
  services.deleteUser = deleteUser;
  services.deleteAllUsers = deleteAllUsers;

  return services;
});
export default module;
