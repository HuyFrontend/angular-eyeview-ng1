import controller from './../controllers/aside';

let myAsideDirective = function () {
  return {
    restrict: 'A',
    controller: controller,
    controllerAs: 'vm',
    bindToController: true,
    templateUrl: require('app/modules/aside/templates/aside.html')
  };
};
export default myAsideDirective;
