import angular from 'angular';
import controller from './controllers/watchlist';

let module = angular.module('app.watchlist', []);

module.controller('WatchlistController', controller);

module.config(($stateProvider) => {
  'ngInject';
  $stateProvider
    .$state('app.watchlist', {
      page_title: 'Watch List',
      ncyBreadcrumb: {
        label: 'Watch List'
      },
      url: '/watchlist',
      views: {
        'main': {
          templateUrl: require("app/modules/watchlist/templates/watchlist.html"),
          controller: 'WatchlistController',
          controllerAs: 'vm',
          needChargify: true
        }
      },
      resolve: {
        lazyLoad: ($q, $ocLazyLoad)=> {
          'ngInject';
          let deferred = $q.defer();
          require.ensure([
            'app/common/services/util',
            'app/common/services/resource',

          ], (require)=> {
            // Load file into app
            let resourceFactory = require('app/common/services/resource');
            let utilFactory = require('app/common/services/util');
            // inject module
            $ocLazyLoad.load([
              {name: utilFactory.default.name},
              {name: resourceFactory.default.name}
            ]);
            deferred.resolve();
          });
          return deferred.promise;
        },
      }
    });
});

export default module;
