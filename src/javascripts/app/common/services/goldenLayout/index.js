import UtilService from './../util';
import GoldenLayoutService from './goldenLayout.service';
let AppGoldenLayoutService = angular.module('app.common.services.goldenLayout', [
    UtilService.name
])
  .service('GoldenLayoutService', GoldenLayoutService);

export default AppGoldenLayoutService;
