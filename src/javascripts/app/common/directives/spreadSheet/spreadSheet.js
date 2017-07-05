import angular from "angular";
import * as _ from "lodash";
let module = angular.module('common.directives.spreadSheet', []);
module.directive('spreadSheet', () => {
  function linkFn(scope, elem, attrs, ngModel) {

  }

  function controllerFn($scope, $filter) {
    var vm = this;
    var defaultExcludeColumns = ['Longitude', 'Latitude', 'Id', 'Distance', 'longitude', 'latitude', 'id', 'distance', 'libraryId', 'ownerId'];
    vm.items = vm.items || [];
    vm.headers = vm.headers || [];
    vm.keys = vm.keys ? vm.keys : vm.headers ? _.map(vm.headers, function (name, idx) {
      return name.replace(/ /g, '').toLowerCase();
    }) : [];
    vm.isEdited = vm.isEdited || false;
    vm.excludeFilters = (vm.excludeFilters && defaultExcludeColumns.concat(vm.excludeFilters)) || defaultExcludeColumns;
    vm.showDeleteButton = vm.showDeleteButton === "true";
    vm.delete = function (item) {
      vm.deleteFn({item: item});
    };
    vm.options = vm.options || {};
    vm.changeSorting = function (header) {
      var direction = vm.options.sort.field === header ? !vm.options.sort.asc : true;
      vm.options.sort.field = header;
      vm.options.sort.asc = direction;
      vm.filterItem(vm.items);
    };
    vm.filterItem = function (items, filter, sorting) {
      filter = (vm.options.filter && vm.options.filter.enabled && (filter || vm.options.filter.fields)) || {};
      sorting = (vm.options.sort && vm.options.sort.enabled && (sorting || vm.options.sort)) || {};
      var promise = vm.options.onFilter && vm.options.onFilter(items, filter, sorting);
      promise && promise.then && promise.then(function (resp) {
      });
      // return items;
    };

    vm.isFilterable = function (col) {
      return vm.excludeFilters.indexOf(col) === -1;
    };
  }

  return {
    restrict: 'E',
    templateUrl: require('app/common/directives/spreadSheet/templates/spreadSheet.html'),
    link: linkFn,
    controller: [
      '$scope',
      '$filter',
      controllerFn
    ],
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      items: '=data',
      headers: '=columns',
      keys: '=?',
      isEdited: '@',
      pageSize: '=',
      pageIndex: '=',
      showDeleteButton: '@',
      deleteFn: '&',
      options: '=?',
      excludeFilters: '=?'
    }
  };
});

module.directive('spreadSheetCell', () => {
  function linkFn(scope, elem, attrs, ngModel) {
    elem.find('label').on('click', function (e) {
      scope.$apply(function () {
        scope.vm.isEdited = true;
      });
    });

    elem.find('input').on('blur', function () {
      scope.$apply(function () {
        scope.vm.isEdited = false;
      });
    });

    scope.$on('$destroy', function () {
      elem.find('label').off('click');
      elem.find('input').off('blur');
    })
  }

  function controllerFn($scope) {
    var vm = this;
    vm.isEdited = false;
  }

  return {
    restrict: 'E',
    templateUrl: require('app/common/directives/spreadSheet/templates/spreadSheetCell.html'),
    link: linkFn,
    controller: [
      '$scope',
      controllerFn
    ],
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      item: '='
    }
  };
});
export default module;
