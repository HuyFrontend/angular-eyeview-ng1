import angular from "angular";
import controller from "./controllers/manageCamera";
import template from "./templates/manageCamera.html";

let module = angular.module('app.manageCamera', []);
module.controller('ManageCameraController', controller);
module.config(
  ($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('app.manageCamera', {
        page_title: 'Manage Camera',
        ncyBreadcrumb: {
          label: 'Manage Camera'
        },
        url: '/manage-camera',
        views: {
          'main': {
            templateUrl: template,
            controller: 'ManageCameraController',
            controllerAs: 'manageCamera'
          },
          'aside': {

          }
        },
        resolve: {
          lazyLoad: ($q, $ocLazyLoad)=> {
            'ngInject';
            let deferred = $q.defer();
            require.ensure([
              'app/common/components/manageCameraGoldenLayout'
            ], (require)=> {
              // Load file into app
              let manageCameraGoldenLayoutComp = require('app/common/components/manageCameraGoldenLayout');
              // inject module

              $ocLazyLoad.load([
                {
                  name: manageCameraGoldenLayoutComp.default.name
                }
              ]);

              deferred.resolve();
            });
            return deferred.promise;
          }
        },
        authorization: true
      });
  }
);
export default module;
