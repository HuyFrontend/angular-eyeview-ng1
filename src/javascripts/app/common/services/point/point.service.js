/*@ngInject*/
export default class PointService {
  constructor($q, $http, appConstant, $rootScope) {
    this._$q = $q;
    this._$http = $http;
    this._appConstant = appConstant;
    this._$rootScope = $rootScope;
  }

  /**
   * Search point by geobound.
   *
   * @param operatorId
   * @param model {Latitude, Longitude, Distance}
   * @returns {*}
   */
  searchPointInAreaByOperatorId(operatorId, model) {
    let self = this;

    return self._$http.post(
      `${self._appConstant.domain}/api/${self._appConstant
        .apiVersion}/point/search/location`,
      model,
      {
        ignoreLoadingBar: true
      }
    );
  }

  getCamerasOfPoint(pointId) {
    let self = this;

    return self._$http.get(
      `${self._appConstant.domain}/api/${self._appConstant
        .apiVersion}/point/${pointId}/cameras`
    );
  }

  getRecordedVideoOfPoint(pointId, searchParams, take, skip) {
    let self = this;

    return self._$http.post(
      `${self._appConstant.domain}/api/${self._appConstant
        .apiVersion}/point/${pointId}/recordvideo/${take}/${skip}`,
      searchParams,
      {
        ignoreLoadingBar: true
      }
    );
  }

  searchPointLocationWithInfo(keyword = "", take = 20, skip = 0, opt = {}) {
    /**
     * TODO not yet completed
     */
    let self = this;
    let payload = { keyword };

    //validate input data
    if (opt.includeLocation) {
      let bound = {
        BoundTopRightLat: "boundTopRightLat",
        BoundTopRightLon: "boundTopRightLon",
        BoundBottomLeftLat: "boundBottomLeftLat",
        BoundBottomLeftLon: "boundBottomLeftLon"
      };
      Object.keys(bound).forEach(key => {
        let item = bound[key];
        if (!opt[key])
          throw new Error(`Missing ${item} for search point using location`);
        if (opt[key] && typeof opt[key] !== "number")
          throw new Error(`Type of ${item} must be number`);
        payload[item] = opt[key];
      });
      payload.includeLocation = opt.includeLocation;
    } else payload.includeLocation = false;

    //parse data structure from api to suitable structure
    const parseData = data => {
      let rs = {};
      rs.total = data.total;
      rs.data =
        data.points &&
        data.points.map(item => {
          return {
            points: { ...item, type: 2 }
          };
        });
      return rs;
    };

    let promise = new Promise((resolve, reject) => {
      self._$http
        .post(
          `${self._appConstant.domain}/api/${self._appConstant
            .apiVersion}/point/search/keyword/${take}/${skip}`,
          {
            ...payload
          },
          { ignoreLoadingBar: true }
        )
        .then(res => {
          resolve(parseData({ ...res.data }));
        })
        .catch(er => {
          reject(er);
        });
    });
    return promise;
  }
}
