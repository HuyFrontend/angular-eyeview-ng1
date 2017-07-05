import ngFileUpload from 'ng-file-upload';
import UserService from './user.service';

let AppUploadService = angular.module('app.services.user', [
    ngFileUpload
])
  .service('UserService', UserService);

export default AppUploadService;
