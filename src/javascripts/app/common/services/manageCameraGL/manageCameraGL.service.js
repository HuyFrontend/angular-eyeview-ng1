import referenceTypes from "app/common/resources/referenceTypes.json";
import FIELD from "app/common/resources/fields.json";

/*@ngInject*/
export default class ManageCameraGLService {
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



}
