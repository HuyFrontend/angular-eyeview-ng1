import templateUrl from './overlayLoader.template.html';
import Controller from './overlayLoader.controller.js';

let Component = {
  restrict: 'E',
  bindings: {
    name: '@'
  },
  templateUrl,
  controller: Controller
};

export default Component;
