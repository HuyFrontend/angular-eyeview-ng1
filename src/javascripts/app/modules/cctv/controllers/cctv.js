let controller = function($state, $rootScope, $scope, PointService) {
  "ngInject";
  //declare global varibles
  let vm = this;
  this._pointService = PointService;
  this._$rootScope = $rootScope;
  this._$scope = $scope;
  //declare default data
  vm.keyword = null;
  vm.searchResult = {};
  vm.config = { take: 20, skip: 0 };

  //Event recieve search result
  this._$rootScope.$on("searchCctvEvent", (e, data) => {
    switch (data.task) {
      case "searchResult":
        vm.searchResult = data.payload;
        if (!vm.searchResult.data) vm.searchResult.data = [];
        vm.startIndex =
          vm.searchResult.currentIndex - vm.searchResult.data.length + 1;
        vm.startIndex = vm.startIndex <= 0 ? 1 : vm.startIndex;
        vm.endIndex = vm.searchResult.currentIndex;
        this._$scope.$apply();
        break;
    }
  });

  vm.submitSearch = () => {
    this._$rootScope.$broadcast("searchCctvEvent", {
      task: "search",
      payload: { ...vm.config, keyword: vm.keyword }
    });
  };

  vm.focusThisPoint = point => {
    this._$rootScope.$broadcast("searchCctvEvent", {
      task: "focus",
      payload: point
    });
  };

  vm.closeSearch = () => {
    vm.keyword = "";
    vm.searchResult = {};
    this._$rootScope.$broadcast("searchCctvEvent", {
      task: "closeSearch",
      payload: {}
    });
  };

  vm.toggleLocationReload = () => {
    this._$rootScope.$broadcast("searchCctvEvent", {
      task: "toggleLocationReload",
      payload: {
        locationReload: vm.locationReload || false
      }
    });
  };
  vm.showNext = () => {
    let skip = vm.searchResult.currentIndex > vm.searchResult.total
      ? vm.searchResult.total
      : vm.searchResult.currentIndex;
    if (skip === vm.searchResult.total) return;

    this._$rootScope.$broadcast("searchCctvEvent", {
      task: "showNext",
      payload: {
        skip
      }
    });
  };
  vm.showPrev = () => {
    let skip =
      (vm.searchResult.data
        ? vm.searchResult.currentIndex - vm.searchResult.data.length
        : vm.searchResult.currentIndex - vm.config.take) - vm.config.take;
    skip = skip >= 0 ? skip : 0;
    this._$rootScope.$broadcast("searchCctvEvent", {
      task: "showPrev",
      payload: {
        skip
      }
    });
  };
};
export default controller;
