/*@ngInject*/
export default class MarkupService {
  constructor($q,
              $http,
              appConstant,
              $rootScope) {
    this._$q = $q;
    this._$http = $http;
    this._appConstant = appConstant;
    this._$rootScope = $rootScope;
  }

  /**
   * Get all markup
   * @param model
   * @param operatorId
   * @param jobId
   * @returns {*}
   */
  getAllMarkups(model) {
    let self = this;
    return this._$http.post(`${this._appConstant.domain}/api/${this._appConstant.apiVersion}/markup/search/geobound`, model, {
      ignoreLoadingBar: true
    });
  }
}
