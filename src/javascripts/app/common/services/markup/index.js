import MarkupService from './markup.service';

let AppMarkupService = angular.module('app.services.markup', [])
  .service('MarkupService', MarkupService);

export default AppMarkupService;
