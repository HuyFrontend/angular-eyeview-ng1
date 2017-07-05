import angular from 'angular';
import * as _ from 'lodash';
let controller = function ($rootScope,
                           confirmationFactory,
                           $filter,
                           toaster,
                           // inject service of watch list here
                           ResourceService) {
  'ngInject';
  var vm = this;

   //remove camera from watch list
  function removeFromWatchList(camera) {
   //todo impl function for remove camera from watch list here
  }


  //todo define list cameras here
  vm.listCameras = [

  ];

};
export default controller;
