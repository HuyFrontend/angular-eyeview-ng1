import UtilService from './../util';
import ManageCameraGLService from './manageCameraGL.service';
let AppManageCameraGLService = angular.module('app.services.manageCameraGL', [
  UtilService.name
])
  .service('ManageCameraGLService', ManageCameraGLService);

export default AppManageCameraGLService;

