/*@ngInject*/
export default class CameraService {
  constructor($q,
              $http,
              appConstant,
              $rootScope,
  ) {
    this._$q = $q;
    this._$http = $http;
    this._appConstant = appConstant;
    this._$rootScope = $rootScope;
  }

  /**
   * Search camera by geobound.
   *
   * @param operatorId
   * @param jobId
   * @param model {Latitude, Longitude, Distance}
   * @returns {*}
   */
  searchCamInAreaByOperatorId(operatorId, jobId, model) {
    let self = this;

    return self._$http.post(`${self._appConstant.domain}/api/${self._appConstant.apiVersion}/camera/search/location`, model, {
      ignoreLoadingBar: true
    });
  };

}
