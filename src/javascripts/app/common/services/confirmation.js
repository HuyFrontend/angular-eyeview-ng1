import angular from 'angular';

let module = angular.module('common.directives.confirmation', []);


module.controller('ConfirmationController', function ($uibModalInstance,
                                                      message) {
  'ngInject';

  var vm = this;

  vm.confirmMessage = message;

  /**
   * OK Button function
   */
  function ok() {
    $uibModalInstance.close(true);
  }

  /**
   * Cancel button function
   */
  function cancel() {
    // $uibModalInstance.dismiss('cancel');
    $uibModalInstance.close(false);
  }

  vm.ok = ok;
  vm.close = cancel;
});
module.controller('CustomModalController', function ($uibModalInstance,
                                                     options) {
  'ngInject';

  var vm = this;

  vm.options = options;

  /**
   * OK Button function
   */
  function ok() {
    $uibModalInstance.close(true);
  }

  /**
   * Cancel button function
   */
  function cancel() {
    // $uibModalInstance.dismiss('cancel');
    $uibModalInstance.close(false);
  }

  vm.ok = ok;
  vm.close = cancel;
});
module.controller('ImportStatusModalController', function ($uibModalInstance,
                                                           $rootScope) {
  'ngInject';

  var vm = this;

  function logout() {
    $uibModalInstance.close(false);
  }
    vm.logout = logout;
});

module.factory('confirmationFactory',
  ($uibModal,
   $q,
   $uibModalStack) => {
    'ngInject';

    var services = {};

    /**
     * Show confirm box
     */
    function showConfirmBox(message) {
      var deferred = $q.defer();
      var modalInstance = $uibModal.open({
        templateUrl: require('app/common/templates/confirmation.html'),
        controller: 'ConfirmationController',
        controllerAs: 'vm',
        bindToController: true,
        resolve: {
          message: function () {
            return message;
          }
        }
      });
      modalInstance.result.then(function (value) {
        deferred.resolve(value);
      });
      return deferred.promise;
    }

    /**
     * Show static confirm box
     */
    function showStaticConfirmBox(message) {
      var deferred = $q.defer();
      var modalInstance = $uibModal.open({
        templateUrl: require('app/common/templates/confirmation.html'),
        controller: 'ConfirmationController',
        controllerAs: 'vm',
        bindToController: true,
        backdrop: 'static',
        keyboard: false,
        resolve: {
          message: function () {
            return message;
          }
        }
      });
      modalInstance.result.then(function (value) {
        deferred.resolve(value);
      });
      return deferred.promise;
    }


    /**
     * show custom message
     * @param options
     * @returns {*}
     */
    function showCustomModal(options) {
      var deferred = $q.defer();
      var modalInstance = $uibModal.open({
        templateUrl: require('app/common/templates/custom.modal.html'),
        controller: 'CustomModalController',
        controllerAs: 'vm',
        bindToController: true,
        windowClass: options.className || '',
        resolve: {
          options: function () {
            return options;
          }
        }
      });
      modalInstance.result.then(function (value) {
        deferred.resolve(value);
      });
      return deferred.promise;
    }

    function showResultDataImportStatusModal() {
      var deferred = $q.defer();
      $uibModalStack.dismissAll();
      var modalInstance = $uibModal.open({
        templateUrl: require('app/common/templates/import.status.modal.selection.html'),
        controller: 'ImportStatusModalController',
        controllerAs: 'vm',
        backdrop: 'static',
        keyboard: false,
        bindToController: true
      });
      modalInstance.result.then(function (value) {
        $uibModalStack.dismissAll();
        deferred.resolve(value);
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    }
    function showModalChoiceOperator(){
      var deferred = $q.defer();
      $uibModalStack.dismissAll();
      var modalInstance = $uibModal.open({
        templateUrl: require('app/common/templates/choice.operator.modal.html'),
        controller: 'ImportStatusModalController',
        controllerAs: 'vm',
        backdrop: 'static',
        keyboard: false,
        bindToController: true
      });
      modalInstance.result.then(function (value) {
        $uibModalStack.dismissAll();
        deferred.resolve(value);
      }, function () {
        deferred.reject();
      });
      return deferred.promise;
    }

    services.showConfirmBox = showConfirmBox;
    services.showCustomModal = showCustomModal;
    services.showResultDataImportStatusModal = showResultDataImportStatusModal;
    services.showStaticConfirmBox = showStaticConfirmBox;
    services.showModalChoiceOperator = showModalChoiceOperator;
    return services;
  }
);
export default module;
