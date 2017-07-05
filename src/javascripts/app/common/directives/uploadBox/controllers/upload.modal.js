let controller = function ($uibModalInstance,
                           options) {
  'ngInject';
  var vm = this;

  function ok() {
    $uibModalInstance.close(vm.files);
  }

  function cancel() {
    $uibModalInstance.dismiss('cancel');
  }

  vm.multiple = options.multiple;
  vm.fileTypes = options.fileTypes;
  vm.maxSize = options.maxSize;
  vm.files = [];
  vm.ok = ok;
  vm.cancel = cancel;
};
export default controller;
