
import PointService from './point.service';

let AppPointService = angular.module('app.services.point', [])
  .service('PointService', PointService);

export default AppPointService;
