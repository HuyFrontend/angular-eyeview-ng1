import angular from "angular";
import controller from "./controllers/home";
import template from "./templates/home.html";

let module = angular.module('app.home', []);
module.controller('HomeController', controller);
module.config(
  ($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('app.home', {
        page_title: 'Home page',
        ncyBreadcrumb: {
          label: 'Home page'
        },
        url: '/home',
        views: {
          'main': {
            templateUrl: template,
            controller: 'HomeController',
            controllerAs: 'home'
          },
          'aside': {
            //template: "hello",
            //controller: 'HomeController',
            //controllerAs: 'home'
          }
        },
        resolve: {
          lazyLoad: ($q, $ocLazyLoad)=> {
            'ngInject';
            let deferred = $q.defer();
            require.ensure([
              'app/common/components/goldenLayout'
            ], (require)=> {
              // Load file into app
              let goldenLayoutComp = require('app/common/components/goldenLayout');
              // inject module
              $ocLazyLoad.load([
                {name: goldenLayoutComp.default.name}
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
