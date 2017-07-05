import angular from "angular";

let module = angular.module('common.directives.deleteDialog', []);


module.controller('deleteDialogController', function (options,
                                                      callback,
                                                      $uibModalInstance) {
  'ngInject';
  this.options = angular.copy(options);

  this.ok = function () {
    callback(function () {
      $uibModalInstance.close();
    });
  };

  this.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

module.factory('deleteDialogFactory',
  ($uibModal) => {
    'ngInject';

    var services = {};

    services.options = {
      title: 'Delete Dialog',
      content: 'Are you sure delete?',
      buttonOk: 'Ok',
      buttonCancel: 'Cancel'
    };

    services.open = function (callback, options) {
      if (angular.isDefined(options)) {
        services.options = options;
      }

      return $uibModal.open({
        animation: true,
        templateUrl: require('app/common/directives/deleteDialog/templates/deleteDialog.html'),
        controller: 'deleteDialogController',
        controllerAs: 'model',
        size: 'md',
        windowClass: '',
        resolve: {
          options: function () {
            return services.options;
          },
          callback: function () {
            return callback;
          }
        }
      }).result;
    };

    return services;
  });
export default module;