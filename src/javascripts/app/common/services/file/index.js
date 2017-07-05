
import FileService from './file.service';

let AppFileService = angular.module('app.services.file', [])
  .service('FileService', FileService);

export default AppFileService;
