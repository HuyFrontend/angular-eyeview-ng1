import Component from './viewcamera.component';
import angularHLSVideo from '../angular-hls-video';

let AppViewCameraComponent = angular.module('app.main.components.viewcamera', [angularHLSVideo])
  .component('viewcamera', Component);

export default AppViewCameraComponent;
