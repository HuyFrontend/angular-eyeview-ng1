import angular from 'angular';
import * as _ from 'lodash';
import jqueryMouseWheel from 'jquery-mousewheel';
import malihuScrollBar from 'malihu-custom-scrollbar-plugin';

let module = angular.module('common.directives.malihuScrollBar', []);
module.factory('MalihuScroller', ($rootScope) => {
  'ngInject';
    return function(scrollId) {
      let $this = this;
      this.id = scrollId;
      this.atBottom = false;

      this.updateScroll = function() {
        $rootScope.$broadcast('malihuScrollBar.' + scrollId + '.updateScroll');
      };

      this.scrollTo = function(e) {
        $rootScope.$broadcast('malihuScrollBar.' + scrollId + '.scrollTo', e);
      };

      this.destroy = function() {
        $rootScope.$broadcast('malihuScrollBar.' + scrollId + '.destroy');
      };

      this.create = function() {
        $rootScope.$broadcast('malihuScrollBar.' + scrollId + '.create');
      };
    };
});
  module.factory('$malihuScroll', () =>  {
    let scrollers = [],
      services = {};

    services.add = function(scroller) {
      scrollers.push(scroller);
    };

    services.remove = function(id) {
      _.remove(scrollers, {id: id});
    };

    services.update = function(id, obj) {
      let found = services.get(id);
      if(found) {
        let idx = _.findIndex(scrollers, {id: id});
        scrollers[idx] = angular.extend(found, obj);
      }
    };

    services.get = function(id) {
      if(id) {
        return _.find(scrollers, {id: id});
      } else {
        return scrollers[scrollers.length - 1];
      }
    };

    return services;
  });
  module.directive('malihuScrollBar',($parse,
             $malihuScroll,
             utilFactory,
             $rootScope,
             MalihuScroller,
             $timeout,
                                      $log) => {
    'ngInject';
    return {
        restrict: 'A',
        link: function(scope, elem, attrs) {
          let scrollId = attrs.malihuScrollBar || utilFactory.makeId(5),
            scroller = new MalihuScroller(scrollId);

          $malihuScroll.add(scroller);

          let options = {
            callbacks: {
              onScroll: function() {
                scroller.atBottom = this.mcs.topPct === 100;
              }
            }
          };

          options = angular.extend({}, options, $parse(attrs.malihuScrollBarOptions)(scope));

          elem.mCustomScrollbar(options);

          //elem.mCustomScrollbar({
          //  axis: "y", // horizontal scrollbar
          //  scrollInertia: 200,
          //  scrollbarPosition: "outside",
          //  callbacks: {
          //    onScroll: function() {
          //      scroller.atBottom = this.mcs.topPct === 100;
          //    }
          //  }
          //});

          scope.$on('malihuScrollBar.update', function() {
            elem.mCustomScrollbar("update");
          });

          scope.$on('malihuScrollBar.' + scrollId + '.updateScroll', function() {
            $log.debug('update scroll');
            elem.mCustomScrollbar("update");
          });

          scope.$on('malihuScrollBar.' + scrollId + '.scrollTo', function(e, dt) {
            $log.debug('scroll to: ', dt);
            $timeout(function() {
              elem.mCustomScrollbar("scrollTo", dt);
            });
          });

          scope.$on('malihuScrollBar.' + scrollId + '.destroy', function() {
            $log.debug('destroy scroll bar');
            elem.mCustomScrollbar("destroy");
          });

          scope.$on('malihuScrollBar.' + scrollId + '.create', function() {
            $log.debug('re-create scroll bar');
            elem.mCustomScrollbar(options);
          });

          scope.$on('$destroy', function() {
            elem.mCustomScrollbar("destroy");
            $malihuScroll.remove(scrollId);
          });
        }
      };
    });
export default module;
