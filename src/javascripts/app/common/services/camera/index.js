
import CameraService from './camera.service';

let AppCameraService = angular.module('app.services.camera', [])
  .service('CameraService', CameraService);

export default AppCameraService;
