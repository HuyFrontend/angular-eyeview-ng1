module.exports = function () {
  let $ocLazyLoad = window.$$ocLazyLoad;
  window.OCLAZYLOAD = {
    /******************************
     *  ANGULAR-MESSAGES
     * **************************** */
    'angular-messages': function (cb) {
      require.ensure([
        'angular-messages'
      ], (require) => {
        let md = require('angular-messages');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  MOMENT
     * **************************** */
    'moment': function (cb) {
      require.ensure([
        'app/vendors/moment'
      ], (require) => {
        let md = require('app/vendors/moment');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  UI-SELECT
     * **************************** */
    'ui-select': function (cb) {
      require.ensure([
        'app/vendors/ui-select'
      ], (require) => {
        let md = require('app/vendors/ui-select');
        $ocLazyLoad.load([
          {name: md.default.name}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  NG-TABLE
     * **************************** */
    'ng-table': function (cb) {
      require.ensure([
        'ng-table'
      ], (require) => {
        let md = require('ng-table');
        $ocLazyLoad.load([
          {name: md.name}
        ]);
        if (cb) {
          cb();
        }
      });
    },
    /******************************
     *  D3JS
     * **************************** */
    'd3': function (cb) {
      require.ensure([
        'app/vendors/d3'
      ], (require) => {
        let md = require('app/vendors/d3');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },
    /******************************
     *  NG BOOTSTRAP CONTEXTMENU
     * **************************** */
    'angular-bootstrap-contextmenu': function (cb) {
      require.ensure([
        'angular-bootstrap-contextmenu'
      ], (require) => {
        let md = require('angular-bootstrap-contextmenu');
        $ocLazyLoad.load([
          {name: md.name || 'ui.bootstrap.contextMenu'}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  D3JS
     * **************************** */
    'd3': function (cb) {
      require.ensure([
        'app/vendors/d3'
      ], (require) => {
        let md = require('app/vendors/d3');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },
    /******************************
     *  nvD3
     * **************************** */
    'nvd3': function (cb) {
      require.ensure([
        'app/vendors/d3',
        'app/vendors/nvd3',
      ], (require) => {
        let md2 = require('app/vendors/d3');
        let md = require('app/vendors/nvd3');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  angular Wizard
     * **************************** */
    'angular-wizard': function (cb) {
      require.ensure([
        'angular-wizard'
      ], (require) => {
        let md = require('exports-loader?"mgo-angular-wizard"!angular-wizard');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  D3JS
     * **************************** */
    'textAngular': function (cb) {
      require.ensure([
        'app/vendors/textAngular'
      ], (require) => {
        let md = require('app/vendors/textAngular');
        $ocLazyLoad.load([
          {name: md.default.name}
        ]);
        if (cb) {
          cb();
        }
      });
    },

    /******************************
     *  angular Moment
     * **************************** */
    'angular-moment': function (cb) {
      require.ensure([
        'angular-moment'
      ], (require) => {
        let md = require('angular-moment');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },
    /******************************
     *  angular ui tab scroll
     * **************************** */
    'angular-ui-tab-scroll': function (cb) {
      require.ensure([
        '../node_modules/angular-ui-tab-scroll/angular-ui-tab-scroll'
      ], (require) => {
        let md = require('exports-loader?"ui.tab.scroll"!../node_modules/angular-ui-tab-scroll/angular-ui-tab-scroll');
        $ocLazyLoad.load([
          {name: md}
        ]);
        if (cb) {
          cb();
        }
      });
    },
  };
};
