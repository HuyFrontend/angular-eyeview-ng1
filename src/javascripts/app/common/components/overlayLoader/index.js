import Component from './overlayLoader.component.js';
import Service from './overlayLoader.service.js';

let AppMainOverlayLoaderComponent = angular.module('app.main.components.overlayLoader', [])
  .component('overlayLoader', Component)
  .service('OverlayLoaderService', Service);

export default AppMainOverlayLoaderComponent;
