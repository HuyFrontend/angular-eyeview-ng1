import * as _ from "lodash";
import GoldenLayout from "app/vendors/goldenLayout";

let load = {

  network: ($q, $ocLazyLoad) => {
    let deferred = $q.defer();
    require.ensure([
      'app/common/components/network',
      'app/vendors/leaflet',
      'app/common/services/markup/index',
      'app/common/services/notifications',
      'app/common/services/file',
      'app/common/services/file/index',
      'app/common/services/resource/index',
      'app/common/services/manageCameraGL',
      'app/common/services/debounce',
      'app/common/services/camera/index',
      'app/common/directives/number',
      'app/common/services/util',
    ], (require) => {
      require('app/vendors/leaflet');

      let networkComponent = require('app/common/components/network');
      let markupService = require('app/common/services/markup/index');
      let fileService = require('app/common/services/file/index');
      let filesService = require('app/common/services/file');
      let notificationsService = require('app/common/services/notifications');
      let debounceService = require('app/common/services/debounce');
      let resourceService = require('app/common/services/resource/index');
      let manageCameraGLService = require('app/common/services/manageCameraGL/index');
      let numberDirective = require('app/common/directives/number');
      let utilServiceComponent = require('app/common/services/util');
      let cameraService = require('app/common/services/camera/index');
      $ocLazyLoad.load([
        {name: networkComponent.default.name},
        {name: fileService.default.name},
        {name: notificationsService.default.name},
        {name: debounceService.default.name},
        {name: filesService.default.name},
        {name: cameraService.default.name},
        {name: markupService.default.name},
        {name: resourceService.default.name},
        {name: manageCameraGLService.default.name},
        {name: numberDirective.default.name},
        {name: utilServiceComponent.default.name},
      ]);
      deferred.resolve();
    });

    return deferred.promise;
  },
};


class Controller {
  /*@ngInject*/
  constructor($element,
              $window,
              $compile,
              $rootScope,
              $ocLazyLoad,
              $q,
              $timeout,
              utilFactory,
              ManageCameraGLService,
              OverlayLoaderService,
              $log) {
    // #1
    this._$element = $element;
    this._$window = $window;
    this._$compile = $compile;
    this._$rootScope = $rootScope;
    this._$ocLazyLoad = $ocLazyLoad;
    this._$q = $q;
    this._$timeout = $timeout;
    this._utilService = utilFactory;
    this._goldenLayoutService = ManageCameraGLService;
    this.initFlag = false;
    this.mapPageOverlayLoader = OverlayLoaderService.init('mapPage');
    this.$log = $log;
    $window.GL = $window.GL || {};
  }

  $onInit() {
    // #3
    this.container = this._$element[0].children[0];
    this.parent = this._$element;
    this.initFlag = true;

    this.refresh();
  }

  $onChanges() {
    // #2
    if (this.initFlag) {
      this.refresh();
    }
  }

  $onDestroy() {
    this._$window.GL.componentConfigs = {};
    this._goldenLayoutService._contentItems = [];
    if (this.goldenLayout) {
      this.goldenLayout = null;
    }
  }

  resize() {
    this.goldenLayout && this.goldenLayout.updateSize();
    this._$rootScope.$broadcast('goldenLayoutSizeChanged');
  }

  refresh() {
    let $this = this;
    // this.parent[0].style.height = this._$window.innerHeight - 70 + 'px';
    //init

    this._$window.GL.layout = this.goldenLayout = new GoldenLayout({
      settings: {
        showPopoutIcon: false,
        showMaximiseIcon: false,
        selectionEnabled: true
      },
      //it is the config object
      content: [
        {
        type: 'row',
        content: [{
          type: 'stack',
          content: [{
            id: 'cameraMap',//'page-dashboard',
            type: 'component',
            title: 'Manage Camera',//'Dashboard',
            isClosable: false,
            componentName: 'manageCameraAngularModule',
            componentState: {
              component: 'network',//'dashboard'
              enableSearchAddress: false,
              enableRuler: true,
              enablePolygon: true,
              enableSearchCamera: false
            }
          }]
        }]
        }
      ],
      dimensions: {
        headerHeight: 60,
        minItemHeight: 460,
        borderWidth: 0
      }
    }, window.jQuery(this.container));

    //register component
    this.goldenLayout.registerComponent('manageCameraAngularModule', (container, state) => {

      $this.$log.debug('show loader for lazy load', container, state);
      $this.mapPageOverlayLoader.show();
      console.time('Loading Modules');
      load[state.component]($this._$q, $this._$ocLazyLoad, $this._$timeout)
        .then(() => {
          console.timeEnd('Loading Modules');
          $this._$timeout(() => {
            $this.$log.debug('hide loader for lazy load', container, state);
            $this.mapPageOverlayLoader.hide();
            // loops in content list then append html into container
            let element = container.getElement(),
              template = element.html('<' + state.component + ' style="display: block; width: 100%;" class="h-full"></' + state.component + '>').children()[0];
            // Compile the content
            $this._$compile(template)(angular.extend($this._$rootScope.$new(), {container: container, state: state}));
          });
        });
    });

    /// Callback for every created stack
    this.goldenLayout.on('stackCreated', (stack) => {

      // Tab change event
      stack.on('activeContentItemChanged', (contentItem) => {
        // Find close button and unbind default click event
        let closeBtn = stack
          .header
          .controlsContainer
          .find('.lm_close') //get the close icon
          .off('click'); // unbind the current click handler

        if (contentItem.config.closeCondition) { // If content item has closeCondition, then call then condition before close window
          closeBtn.click(() => {
            if (!contentItem.container.onClose) {// if no onClose method defined, then close the tab
              contentItem.remove();
            }
            else {// otherwise, call onClose method and pass close function as argument
              contentItem.container.onClose(contentItem);
            }
          });
        } else { // If content item has no closeCondition, then just close the window when close button click
          closeBtn.click(() => contentItem.remove());
        }

        if (!contentItem.config.id) {
          return;
        }

        // hide all custom controls
        let customControls = stack.header.controlsContainer.find(`.lm_custom_control`);
        _.forEach(customControls, (cc) => {
          $(cc).hide();
        });

        if (contentItem.config.popupable) {
          let popoutBtn = stack.header.controlsContainer.find(`.lm_${contentItem.config.id}`);

          if (!popoutBtn.length) {
            popoutBtn = $(`<li class="lm_custom_control lm_popup lm_${contentItem.config.id}" title="open in popup"></li>`);

            popoutBtn.click(() => {
              contentItem.popup();
            });

            // Add the button to the header
            stack.header.controlsContainer.prepend(popoutBtn);
          } else {
            popoutBtn.show();
          }
        }
      });
    });

    this.goldenLayout.on('tabCreated', (tab) => {
      if (tab.contentItem.config.closeCondition) {
        tab
          .closeElement
          .off('click') //unbind the current click handler
          .click(() => {
            if (!tab.contentItem.container.onClose) {// if no onClose method defined, then close the tab
              tab.contentItem.remove();
            }
            else {// otherwise, call onClose method and pass close function as argument
              tab.contentItem.container.onClose(tab.contentItem);
            }
          });
      }
    });

    this.goldenLayout.on('stateChanged', () => {
      this._$rootScope.$broadcast('goldenLayoutSizeChanged');
    });

    this.goldenLayout.on('itemDestroyed', (contentItem) => {
      if (contentItem.type === 'component') {
        delete this._$window.GL.componentConfigs[contentItem.config.id];
        _.remove(this._goldenLayoutService._contentItems, (_contentItem) => {
          return _contentItem.config.id === contentItem.config.id;
        });
      }
    });

    this.goldenLayout.on('itemCreated', (contentItem) => {
      if (contentItem.type === 'component') {
        this._goldenLayoutService._contentItems.push(contentItem);
      }
    });
    this.goldenLayout.init();

    this._goldenLayoutService.setInstance(this.goldenLayout);

    this._$rootScope.$on('asideToggle', () => {
      this._$timeout(() => {
        this.resize();
      });
    });

    // Resize layout on window resize
    this._$window.onresize = () => {
      this._$timeout(() => {
        this.resize();
      });
    };
  }
}

export default Controller;
