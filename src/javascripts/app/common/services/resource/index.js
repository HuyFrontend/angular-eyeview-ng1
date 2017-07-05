import ResourceService from './resource.service';

let AppResourceService = angular.module('app.core.services.resource', [])
  .service('ResourceService', ResourceService);

export default AppResourceService;
