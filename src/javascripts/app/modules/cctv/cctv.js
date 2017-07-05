import angular from 'angular';
import controller from './controllers/cctv';
import searchCctvDirective from './directives/searchCctv';

let module = angular.module('app.cctv', []);
module.controller('CctvController', controller);
module.directive('searchCctv', searchCctvDirective);

export default module;
