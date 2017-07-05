import angular from 'angular';
import * as _ from 'lodash';

let module = angular.module('common.directives.windows', []);

module.service('windowsService', ($Windows,
                                  $rootScope,
                                  $timeout) => {
    'ngInject';
    let service = {};

    let currentTimeout = {};

    function addWindow(id, title, content, options) {
      service.windows.push(new $Windows(id, title, content, options));
      $rootScope.$broadcast('windows:addWindow', {
        id: id,
        top: service.getTop(),
        left: service.getLeft()
      });
    }

    function getWindow(id) {
      return _.find(service.windows, {id: id});
    }

    function update(id, obj) {
      var found = getWindow(id);
      if (found) {
        var idx = _.findIndex(service.windows, {id: id});
        service.windows[idx] = angular.extend(found, obj);
      }
    }

    function remove($window) {
      var idx = service.windows.indexOf($window);
      if (idx) {
        service.windows.splice(idx, 1);
      }
    }

    function setAppendTo(appendTo) {
      service._appendTo = appendTo;
    }

    function getGetAppendTo() {
      return service._appendTo;
    }

    function setTop(top) {
      service._top = top;
    }

    function getTop() {
      return service._top;
    }

    function setLeft(left) {
      service._left = left;
    }

    function getLeft() {
      return service._left;
    }

    function setPosition(position) {
      service._position = position;
    }

    function getPosition() {
      return service._position;
    }

    function autoClose(window) {
      if (window && window.id.indexOf('traceImage') > -1) {
        if (!currentTimeout[window.id] && !window.instance.isPin) {
          currentTimeout[window.id] = $timeout(function () {
            var activeWindow = service.getActiveWindow();

            window.instance.close();

            if (activeWindow) {
              activeWindow.instance.focus();
            }

            service.clearAutoCloseTimeout(window);
          }, 5000);
        }
      }
    }

    function cancelAutoClose(window) {
      if (window && window.id.indexOf('traceImage') > -1) {
        if (currentTimeout[window.id]) {
          $timeout.cancel(currentTimeout[window.id]);
          service.clearAutoCloseTimeout(window);
        }
      }
    }

    function getActiveWindow() {
      var activeWindow = _.find(service.windows, function (w) {
        return w.instance && w.instance._isVisible && w.id && w.id.indexOf('traceImage') === -1;
      });

      return activeWindow;
    }

    function clearAutoCloseTimeout(window) {
      if (window && currentTimeout[window.id]) {
        currentTimeout[window.id] = null;
      }
    }

    function getWindowIsDocked() {
      return _.find(service.windows, function (window) {
        return !window.instance.isFloating();
      });
    }

    function getActiveFloatingWindow() {
      return _.filter(service.windows, function (window) {
        return window.instance.isFloating() && window.isFocus;
      });
    }

    function closeAll() {
      service.closingAll = true;
      _.forEach(service.windows, function (wd) {
        if (wd && wd.instance) {
          wd.instance.close();
        }
      });

      service.windows = [];
      service.closingAll = false;
    }

    function closeAllChangingJobWindow() {
      var currentWd = null;
      for (var i = 0; i < service.windows.length; i++) {
        var currentWd = service.windows[i];
        if (currentWd && currentWd.closeOnChangeJob && currentWd.instance) {
          currentWd.instance.close();
          i--;
        }
      }
      _.remove(service.windows, function (w) {
        return w.closeOnChangeJob;
      });
    }

    function checkClosingAll() {
      return service.closingAll;
    }

    function getLastFocusWindow() {
      return _.find(service.windows, function (w) {
        return w.instance._isVisible && w.isFocus;
      })
    }

    function getSiblingWindows(window) {
      return _.filter(service.windows, {
        stackTo: window
      })
    }

    service.windows = [];
    service._appendTo = '';
    service._left = 0;
    service._top = 0;
    service.setAppendTo = setAppendTo;
    service.getGetAppendTo = getGetAppendTo;
    service.setTop = setTop;
    service.getTop = getTop;
    service.setLeft = setLeft;
    service.getLeft = getLeft;
    service.addWindow = addWindow;
    service.getWindow = getWindow;
    service.update = update;
    service.setPosition = setPosition;
    service.getPosition = getPosition;
    service.remove = remove;
    service.autoClose = autoClose;
    service.cancelAutoClose = cancelAutoClose;
    service.getActiveWindow = getActiveWindow;
    service.clearAutoCloseTimeout = clearAutoCloseTimeout;
    service.mapWindowActualPos = {};
    service.getWindowIsDocked = getWindowIsDocked;
    service.closeAll = closeAll;
    service.getActiveFloatingWindow = getActiveFloatingWindow;
    service.checkClosingAll = checkClosingAll;
    service.getLastFocusWindow = getLastFocusWindow;
    service.getSiblingWindows = getSiblingWindows;
    service.closeAllChangingJobWindow = closeAllChangingJobWindow;
  }
);

module.factory('$Windows', () => {
    'ngInject';
    return function (id, title, content, options) {
      var $window = {};
      $window.title = title;
      $window.content = content;
      $window.width = (options.width || 500) + 'px';
      $window.height = (options.height || 250) + 'px';
      $window.open = options.open;
      $window.close = options.close;
      $window.focus = options.focus;
      $window.id = id;
      $window.position = options.position;
      $window.scrollable = options.scrollable;
      $window.closeable = options.closeable;
      $window.stackTo = options.stackTo || {instance: null};
      $window.top = options.top;
      $window.left = options.left;
      $window.initValues = options.initValues;
      $window.closeButton = options.closeButton;
      $window.backButton = options.backButton;
      $window.autoClose = options.autoClose;
      $window.closeOnChangeJob = options.closeOnChangeJob;
      return $window;
    };
  }
);

module.directive('windows', ($timeout,
                             $rootScope,
                             $compile,
                             windowsService,
                             notifications,
                             utilFactory) => {
    'ngInject';
    function linkFn(scope, elem, attrs) {

      var html = '<div class="docker-container"></div>';
      elem.append(html);

      var myDocker = new wcDocker('.docker-container', {
        // allowDrawers: true,
        responseRate: 10,
        allowContextMenu: false, //remove default docker context menu
        allowCollapse: false,
        themePath: 'js/wcDocker/Themes',
        theme: 'ims'
      });

      function pinDocker(window, panel, name) {
        if (panel) {
          panel.isPin = true;
          panel.removeButton(name);
          windowsService.cancelAutoClose(window);
        }
      }

      function addDockButton(panel, dockButton) {
        panel.addButton(dockButton, 'fa fa-clone fa-rotate-90', '', 'Dock a panel', true, 'fa fa-clone');
      }

      function removeDockButton(panel, dockButton) {
        if (!panel.isFloating()) {
          panel.removeButton(dockButton);
        }
      }

      function addCloseButton(panel, closeButton) {
        panel.addButton(closeButton, 'fa fa-times', '', 'Close panel', false);
      }

      function addBackButton(panel, backButton) {
        panel.addButton(backButton, 'fa fa-undo', 'Back', 'Back to Uti', false);
      }

      function checkExistButton(panel, button) {
        return _.some(panel._buttonList, function (btn) {
          return btn.name === button;
        });
      }

      scope.$on('windows:addWindow', function (e, args) {
        var $window = windowsService.getWindow(args.id);
        var contentScope = scope.$new();
        contentScope.vm = {};
        var pinButton = 'pin';
        var dockButton = 'dock';
        var closeButton = 'close';
        var backButton = 'back';
        var id = utilFactory.makeId(10);
        // contentScope.vm.windowId = id;

        myDocker.registerPanelType(id, {
          layout: wcDocker.LAYOUT.SIMPLE,
          onCreate: function (myPanel) {
            if ($window.initValues) {
              $window.initValues(contentScope.vm);
            }
            var template = $window.content;
            var compiled = $compile(template)(contentScope);

            myPanel.layout().addItem(compiled);
            myPanel.scrollable($window.scrollable, $window.scrollable);
            if ($window.closeable === false) {
              myPanel.closeable($window.closeable);
            }
            if ($window.title) {
              myPanel.title($window.title);
            }
            if ($window.closeButton) {
              addCloseButton(myPanel, closeButton);
            }
          },
          isPersistent: false
        });

        var panel = myDocker.addPanel(id, $window.position, $window.stackTo.instance, {
          x: $window.left,
          y: $window.top,
          h: $window.height,
          w: $window.width
        });

        panel.focus();
        if ($window.focus) {
          $window.focus();
        }
        $window.isFocus = true;
        $window.instance = panel;

        panel.on(wcDocker.EVENT.CLOSED, function () {

          notifications.closeWindow();
          if ($window.close) {
            $window.close();
          }

          // Before closing window check to focus on not closing window
          var siblingWindows = windowsService.getSiblingWindows($window);

          // Assign new stackTo window for sibling
          _.each(siblingWindows, function (w) {
            w.stackTo = siblingWindows[0];
          });

          if (!windowsService.checkClosingAll()) {
            windowsService.remove($window);
          }
          var activeWindow = windowsService.getLastFocusWindow();
          if ($window.stackTo && $window.stackTo.instance) {
            $window.stackTo.instance.focus();
          }
          else if (siblingWindows.length) {
            // Close the stacked window
            siblingWindows[0].instance.focus();
          }
          else {
            if (activeWindow) {
              activeWindow.instance.focus();
            }
          }

          windowsService.clearAutoCloseTimeout($window);
        });

        panel.on(wcDocker.EVENT.END_DOCK, function () {
          notifications.endDockWindow();
        });

        panel.on(wcDocker.EVENT.GAIN_FOCUS, function () {
          if ($window.focus && panel.isVisible()) {
            $window.focus();
          }
          $window.isFocus = true;
        });
        panel.on(wcDocker.EVENT.LOST_FOCUS, function () {
          $window.isFocus = false;
        });

        panel.on(wcDocker.EVENT.LOADED, function () {
          if ($window.focus && panel.isVisible()) {
            $window.focus();
          }
        });

        panel.on(wcDocker.EVENT.MOVE_STARTED, function () {
          pinDocker($window, panel, pinButton);
        });

        panel.on(wcDocker.EVENT.MOVE_ENDED, function () {
          var isButtonValid = _.some(panel._buttonList, function (button) {
            return button.name === dockButton;
          });

          if (panel.isFloating() && !isButtonValid) {
            addDockButton(panel, dockButton);
            return;
          }

          if (!panel.isFloating() && isButtonValid) {
            removeDockButton(panel, dockButton);
          }

          if ($window.backButton && !checkExistButton(panel, backButton)) {
            addBackButton(panel, backButton);
          }
        });

        panel.on(wcDocker.EVENT.BUTTON, function (e) {
          if (e.name === pinButton && e.isToggled) {
            pinDocker($window, panel, pinButton);
          }

          if (e.name === dockButton && e.isToggled) {
            var containWindow = windowsService.getWindowIsDocked();

            if (containWindow) {
              myDocker.movePanel(panel, wcDocker.DOCK.STACKED, containWindow.instance);
            } else {
              myDocker.registerPanelType('custom', {
                // isPersistent: true,
                layout: wcDocker.LAYOUT.SIMPLE,
                onCreate: function (myPanel) {

                }
              });

              var queuePanel = myDocker.addPanel('custom', wcDocker.DOCK.STACKED, null, {
                h: '100%',
                w: '100%'
              });

              myDocker.movePanel(panel, wcDocker.DOCK.STACKED, queuePanel);
              myDocker.removePanel(queuePanel, false);
            }

            panel.focus();
            removeDockButton(panel, dockButton);
          }
        });

        if ($window && $window.id.indexOf('traceImage') > -1 && $window.autoClose) {
          panel.addButton(pinButton, 'fa fa-thumb-tack', 'Pin', 'Pin a panel', true, 'fa fa-thumb-tack');
          windowsService.autoClose($window);
        }

        if ($window && $window.id.indexOf('MapWindow') > -1) {
          windowsService.mapWindowActualPos = angular.copy(panel._actualPos);
        }
      });

    }

    function controllerFn(windowsService, $scope) {
      var vm = this;
      vm.initWindows = vm.initWindows || [];
      vm.left = vm.left || 0;
      vm.top = vm.top || 0;
      vm.windows = windowsService.windows;

      // Save values
      windowsService.setAppendTo(vm.appendTo);
      windowsService.setTop(vm.top);
      windowsService.setLeft(vm.left);

      if (vm.initWindows.length) {
        $timeout(function () {
          _.each(vm.initWindows, function (el) {
            windowsService.addWindow(el.id, el.title, el.content, el.options);
          });
        });
      }

      $scope.$on('$destroy', function () {
        vm.initWindows = [];
      });

    }

    return {
      restrict: 'E',
      controller: [
        'windowsService',
        '$scope',
        controllerFn
      ],
      bindToController: true,
      controllerAs: 'vm',
      scope: {
        initWindows: '=',
        appendTo: '@',
        left: '@',
        top: '@'
      },
      link: linkFn
    };
  }
);
export default module;
