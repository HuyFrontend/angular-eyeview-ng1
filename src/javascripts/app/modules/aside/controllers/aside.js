import * as _ from 'lodash';
import moment from 'moment';
import importDataStatusJson from "app/common/resources/importDataStatus.json";
import JOB_STATUS from "app/common/resources/jobStatus.json";

let controller = function (appConstant,
                           $state,
                           GoldenLayoutService,
                           $rootScope,
                           $timeout,
                           notifications,
                           $scope
                           ) {
  'ngInject';
  let vm = this;

  function openMapWindow() {
    let timeout = 0;
    if ($state.current.name !== 'app.home') {
      $state.go('app.home');
      timeout = 1000;
    }

    $timeout(function () {
      GoldenLayoutService.newMapTab();
    }, timeout);
  }


  vm.$state = $state;
  vm.scrollOptions = {
    theme: 'minimal-dark',
    scrollbarPosition: 'outside',
    axis: "y"
  };
  vm.importDataStatus = importDataStatusJson;
  vm.JOB_STATUS = JOB_STATUS;

  $scope.$on('$destroy', () => {
  })
};
export default controller;
