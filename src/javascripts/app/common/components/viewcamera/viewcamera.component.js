import templateUrl from './viewcamera.template.html';
import Controller from './viewcamera.controller.js';

let Component = {
  restrict: 'E',
  bindings: {
    model: '<',
    latlng: '<',
    typeView: '<'
  },
  templateUrl,
  controller: Controller
};

export default Component;
