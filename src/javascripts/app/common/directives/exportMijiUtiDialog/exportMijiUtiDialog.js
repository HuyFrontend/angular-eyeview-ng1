import angular from 'angular';
import * as _ from 'lodash';

let module = angular.module('common.directives.exportMijiUtiDialog', []);

class ExportMijiUtiDialogCtrl {
  constructor(opts,
              callback,
              $uibModalInstance,
              miji) {
    'ngInject';
    let self = this;
    self.$uibModalInstance = $uibModalInstance;
    self.callback = callback;
    self.options = angular.copy(opts);
    self.miji = miji;
    self.uties = miji.linkedUti;
    self.utiIdsSorted = _.map(self.uties, function (n) {
      return n.id;
    });
  }

  ok() {
    let self = this;
    self.callback(self.utiIdsSorted, function () {
      self.$uibModalInstance.close();
    });
  };

  cancel() {
    let self = this;
    self.$uibModalInstance.dismiss('cancel');
  };

  placeholder(element) {
    return element.clone().addClass("placeholder").text("drop here");
  };

  hint(element) {
    return element.clone().addClass("hint");
  };

  dragEnd(e) {
    let self = this;
    let newUtiIdsSorted = [];
    for (let i = 0; i < self.utiIdsSorted.length; i++) {
      if (i === e.newIndex) {
        newUtiIdsSorted.push(self.utiIdsSorted[e.oldIndex]);
      } else if (i === e.oldIndex) {
        newUtiIdsSorted.push(self.utiIdsSorted[e.newIndex]);
      } else {
        newUtiIdsSorted.push(self.utiIdsSorted[i]);
      }
    }
    self.utiIdsSorted = newUtiIdsSorted;
  };
}

module.factory('exportMijiUtiDialogFactory', ($uibModal) => {
    'ngInject';
    let services = {};

    services.options = {
      title: 'Export MIJI',
      buttonOk: 'Export',
      buttonCancel: 'Close'
    };

    services.open = function (callback, miji, options) {
      options = angular.extend(services.options, options) || services.options;

      if (!miji.linkedUti || !miji.linkedUti.length) {
        callback([], () => {
        });
        return;
      }

      let modalInstance = $uibModal.open({
        animation: true,
        templateUrl: require('./templates/exportMijiUtiDialog.html'),
        controller: ExportMijiUtiDialogCtrl,
        controllerAs: '$ctrl',
        size: 'md',
        windowClass: '',
        resolve: {
          opts: function () {
            return options;
          },
          callback: function () {
            return callback;
          },
          miji: function () {
            return miji;
          }
        }
      });
    };

    return services;
  }
);
export default module;
