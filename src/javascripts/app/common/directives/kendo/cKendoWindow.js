import angular from 'angular';

let module = angular.module('common.directives.cKendoWindow', []);
module.directive('cKendoWindow', () => {
  'ngInject';
  function linkFn(scope, elem) {
    var $windowElem = elem.children(), instance;
    instance = $windowElem.kendoWindow({
      width: scope.vm.options.width,
      title: scope.vm.options.title,
      visible: false,
      actions: scope.vm.options.actions,
      open: scope.vm.options.open,
      height: scope.vm.options.height,
      appendTo: scope.vm.options.appendTo || document.body,
      close: scope.vm.options.close,
      deactivate: function () {
        this.destroy();
      }
    }).data("kendoWindow");
    scope.vm.instance = instance;
    scope.vm.options.init.call(instance);
  }

  function controllerFn() {

  }

  return {
    restrict: 'E',
    link: linkFn,
    controller: controllerFn,
    bindToController: true,
    controllerAs: 'vm',
    template: '<div></div>',
    scope: {
      instance: '=',
      options: '='
    }
  };
});
export default module;
