import jQuery from 'jquery';
let directive = function ($rootScope,
                          $cookieStore,
                          $window,
                          $timeout,
                          $malihuScroll) {
  'ngInject';
  return {
    restrict: 'E',
    template: '<span class="menu_toggle" ng-click="toggleSidebar()"><span class="icon_menu_toggle" ></span></span>',
    link: function (scope, el, attrs) {
      var mobileView = 992,
        $scroller = $malihuScroll.get('aside');
      $rootScope.getWidth = function () {
        return window.innerWidth;
      };
      $rootScope.$watch($rootScope.getWidth, function (newValue, oldValue) {
        if (newValue >= mobileView) {
          if (angular.isDefined($cookieStore.get('sideNavCollapsed'))) {
            if ($cookieStore.get('sideNavCollapsed') === false) {
              $rootScope.sideNavCollapsed = false;
            } else {
              $rootScope.sideNavCollapsed = true;
            }
          } else {
            $rootScope.sideNavCollapsed = false;
          }
        } else {
          $rootScope.sideNavCollapsed = true;
        }
        $timeout(function () {
          jQuery(window).resize();
          $rootScope.$broadcast('asideToggle');
        });
      });
      $rootScope.$on('toggleSidebar', () => {
        scope.toggleSidebar();
      });
      scope.toggleSidebar = function () {
        $rootScope.sideNavCollapsed = !$rootScope.sideNavCollapsed;
        $cookieStore.put('sideNavCollapsed', $rootScope.sideNavCollapsed);
        if (!$rootScope.fixedLayout) {
          if (window.innerWidth > 991) {
            $timeout(function () {
              jQuery(window).resize();
            });
          }
        }

        if ($scroller) {
          if (!$rootScope.sideNavCollapsed) {
            $scroller.create();
          } else {
            $scroller.destroy();
          }
        }

        $rootScope.$broadcast('asideToggle');
      };

      if (angular.isDefined($cookieStore.get('sideNavCollapsed')) && $cookieStore.get('sideNavCollapsed')) {
        if ($scroller) {
          $scroller.destroy();
        }
      }
    }
  };
};

export default directive;
