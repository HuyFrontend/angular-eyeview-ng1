// https://docs.angularjs.org/guide/component

import Controller from './manageCameraGoldenLayout.controller';

let Component = {
  restrict: 'E',
  bindings: {
    content: '<'
  },
  template: `<div id="manage-camera-golden-layout"></div>`,
  controller: Controller
};

export default Component;
