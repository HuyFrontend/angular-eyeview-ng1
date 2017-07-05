import controller from './../controllers/cctv';

let searchCctvDirective = function () {
  return {
    restrict: 'A',
    controller: controller,
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: require('app/modules/cctv/templates/cctv.html')
  };
};
export default searchCctvDirective;
