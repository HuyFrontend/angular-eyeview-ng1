import angular from "angular";

let module = angular.module('common.directives.dropdownEditable', []);

module.directive('dropdownEditable', ($timeout) => {
  'ngInject';
  return {
    restrict: 'A',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      list: '=ngList',
      fieldValue: '=ngFieldValue',
      fieldName: '=ngFieldName',
      add: '=ngAdd',
      remove: '=?ngRemove',
      edit: '=?ngEdit',
      role: '=',
      options: '=?'
    },
    replace: true,
    templateUrl: require('app/common/directives/dropdownEditable/templates/dropdownEditable.html'),
    controllerAs: 'vm',
    bindToController: true,
    controller: function ($scope, permissionFactory) {
      'ngInject';
      var vm = this;
      vm.isopen = false;
      vm.isLoading = false;
      vm.autoClose = 'outsideClick';

      vm.changeStatus = function (status) {
        vm.isopen = status;
      };

      vm.addList = function (value) {
        if (!value) {
          return;
        }
        vm.isLoading = true;
        vm.dropdown.value = '';
        vm.add(value, setValue);
      };

      vm.choosed = function (value) {
        setValue(value);
      };

      vm.removeItem = function (item) {

        vm.autoClose = 'disabled';
        vm.remove && vm.remove(item).then(()=> {
          removeItemFromList(item);
          $timeout(()=> {
            vm.autoClose = 'outsideClick';
          });
        }, ()=> {
          $timeout(()=> {
            vm.autoClose = 'outsideClick';
          });
        });
      };
      vm.editItem = function (item) {

        vm.autoClose = 'disabled';
        // open modal to edit
        vm.edit && vm.edit(item).then(()=> {
          $timeout(()=> {
            vm.autoClose = 'outsideClick';
          });
        }, ()=> {
          $timeout(()=> {
            vm.autoClose = 'outsideClick';
          });
        });
      };

      var setValue = function (data) {
        //vm.editableValue = !data ? '' : data[vm.fieldName];

        vm.model = !data ? '' : data[vm.fieldValue];

        vm.changeStatus(false);
        vm.isLoading = false;
      };

      function removeItemFromList(item) {
        item.isDeleted = true;
        if (vm.model === item[vm.fieldValue]) {
          vm.model = '';
        }
      }

      function checkRole() {
        if (vm.role) {
          vm.nopermission = !permissionFactory.checkPermission(vm.role);
        }
      }

      vm.nopermission = false;
      vm.list = vm.list || [];
      vm.distinctOptions = {
        field: vm.fieldName,
        list: vm.list
      };
      checkRole();
    },
    link: function (scope, element, attrs, ngModel) {
      element.find('[type=text]').bind("keypress", function (e) {
        if (e.which === 13 || e.keyCode === 13) {
          scope.vm.addList(angular.element(this).val());
          e.preventDefault();
        }
      });
      if (angular.isDefined(attrs.required)) {
        scope.$watch(function () {
          return ngModel.$modelValue;
        }, function (newV, oldV) {
          ngModel.$setValidity('required', !!newV);
          if (oldV !== newV) {
            ngModel.$setDirty(true);
          }
        })
      }

    }
  };
});
export default module;
