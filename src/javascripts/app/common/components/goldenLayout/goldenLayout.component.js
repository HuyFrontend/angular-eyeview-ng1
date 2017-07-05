// https://docs.angularjs.org/guide/component

import Controller from './goldenLayout.controller';

let Component = {
  restrict: 'E',
  bindings: {
    content: '<'
  },
  template: `<div id="golden-layout"></div>`,
  controller: Controller
};

export default Component;
