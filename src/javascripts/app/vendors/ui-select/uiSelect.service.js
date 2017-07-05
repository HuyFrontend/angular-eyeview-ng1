import * as _ from "lodash";
/*@ngInject*/
export default class uiSelectService {
  constructor($filter) {
    let self = this;
    self._$filter = $filter;

    self.limitedResultCount = 10;
  }

  limitResults(list, count) {
    let self = this;
    return self._$filter('limitTo')(list, count || self.limitedResultCount);
  }

  removeDuplicateItems(origin, patternList, key) {
    origin = angular.copy(origin);
    _.remove(origin, (item)=> {
      return _.indexOf(patternList, item[key]) > -1;
    });
    return origin;
  }
}
