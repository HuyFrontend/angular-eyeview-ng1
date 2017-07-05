/*@ngInject*/
export default class UploadService {
  constructor($q, $http, appConstant, $rootScope) {
    let self = this;
    self._$q = $q;
    self._$http = $http;
    self._appConstant = appConstant;
    self._$rootScope = $rootScope;
  }

}
