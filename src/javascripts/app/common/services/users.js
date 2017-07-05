import angular from 'angular';
let module = angular.module('common.services.userManagement', []);
module.factory('userManagementFactory', ($http,
                                         appConstant) => {
  'ngInject';
  var services = {};
  services.getCustomerInfo = function (customerId) {
    return $http.get(appConstant.domain + '/api/' + appConstant.apiVersion + '/customer/customers/' + customerId
    );
  };
  services.updateCustomerInfo = function (customerId, model) {
    return $http.put(appConstant.domain + '/api/' + appConstant.apiVersion + '/customer/customers/' + customerId, model, {
      message: 'Update Customer Successful'
    });
  };
  services.changeUserRole = function (customerId, userId) {
    return $http.put(appConstant.domain + '/api/' + appConstant.apiVersion + '/customer/customers/' + customerId + '/users/' + userId + '/role', null, {
      message: 'Update User\'s Role Successful'
    });
  };
  return services;
});
export default module;
