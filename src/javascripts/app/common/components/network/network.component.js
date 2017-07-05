import templateUrl from './network.template.html';
import Controller from './network.controller';

let Component = {
  restrict: 'E',
  bindings: {
    cameraList: '<?',
    zoom: '<',
    filter: '<',
    legend: '<',
    search: '<',
    mijiUti: '<',
    draw: '<',
    contextMenu: '<',
    bandColors: '<',
    alarm: '<',
    removeMarkerOnMoveOut: '<',
    displayingTechnology: '<',
    mapId: '@'
  },
  templateUrl,
  controller: Controller
};

export default Component;
