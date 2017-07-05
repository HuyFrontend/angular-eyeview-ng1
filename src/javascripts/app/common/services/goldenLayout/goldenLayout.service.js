import referenceTypes from "app/common/resources/referenceTypes.json";
import FIELD from "app/common/resources/fields.json";

/*@ngInject*/
export default class GoldenLayoutService {
  constructor(utilFactory,
              $window,
              $rootScope,
              $log
  ) {
    this.instance = null;
    this._utilService = utilFactory;
    this._$window = $window;
    this._$rootScope = $rootScope;
    this._contentItems = [];

    this._$log = $log;
    $window.GL = $window.GL || {};
    $window.GL.componentConfigs = $window.GL.componentConfigs || {};
  }

  setInstance(instance) {
    this.instance = instance;
  }

  /**
   * function to set focus window by windowId
   * @param windowId
   */
  setFocus(windowId) {
    let self = this;
    let currentWindow = _.find(self._contentItems, {
      config: {
        id: windowId
      }
    });
    if (currentWindow) {
      // Tab is not active
      !currentWindow.tab.isActive && currentWindow.tab.header.parent.setActiveContentItem(currentWindow);
      return currentWindow;
    }
  }

  //
  // newMapTab(container) {
  //   let self = this;
  //   let windowId = 'NETWORK-MAP';
  //   if (self.setFocus(windowId)) {
  //     return;
  //   }
  //   debugger;
  //   let subject = '', refType;
  //   // Tab config
  //   let config = {
  //     id: windowId,
  //     type: 'component',
  //     title: `Network`,
  //     componentName: 'angularModule',
  //     componentState: {
  //       component: 'network',
  //     },
  //     closeCondition: true,
  //     popupable: false,
  //
  //
  //   };
  //
  //   // Tab state
  //   angular.extend(config.componentState,
  //
  //     {
  //       enableSearchAddress: true,
  //       enableRuler: true,
  //       enablePolygon: true,
  //       enableSearchCamera: false
  //
  //     }
  //   );
  //   if (container) {
  //     this._$log.debug("container");
  //     container.parent.parent.addChild(config);
  //   }
  //   else {
  //     this._$log.debug("root container");
  //     self.instance.root.contentItems[0] // Root
  //       .contentItems[0] // first stack
  //       .addChild(config);
  //   }
  // }

  newViewCameraTab(container, map, latlng, point, typeView) {
    let self = this;
    let windowId = 'CAM_' + point.pointid;
    if (self.setFocus(windowId)) {
      return;
    }
    // Tab Config
    let config = {
      id: windowId,
      type: 'component',
      title: 'CAMERA ' + point.pointname,
      componentName: 'networkAngularModule',
      componentState: {
        component: 'viewcamera'
      },
      closeCondition: true,
      popupable: false
    };
    // Tab State
    angular.extend(config.componentState, {
      map: map,
      container: container,
      data: {
        model: point,
        latlng: latlng,
        typeView: typeView
      }
    });
    container.parent.parent.addChild(config);
    // Save for popup/popin feature
    this._$window.GL.componentConfigs[config.id] = config;
  }
}
