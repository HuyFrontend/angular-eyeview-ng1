import Controller from './infiniteScroll.controller';

let Component = {
  restrict: 'E',
  bindings: {
    event: '&',
    container: '<'
  },
  controller: Controller
};

export default Component;
