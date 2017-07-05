import angular from 'angular';
import Ladda from 'ladda';

let module = angular.module('common.validators.loadingButton', []);
  module.directive('loadingButton', () => {
    return {
      restrict: 'A',
      scope: {
        loadingButton: '='
      },
      link: function(scope, elem, attrs) {
        elem.attr('data-size', attrs.size || 'sm');
        elem.attr('data-style', 'expand-right');
        elem.addClass('ladda-button');
        var innerHtml = elem.html();
        elem.html('<span class="ladda-label">' + innerHtml + '</span>');
        var l = Ladda.create(elem[0]);
        scope.$watch('loadingButton', function(e) {
          if(scope.loadingButton) {
            l.start();
          } else {
            l.stop();
          }
        });
      }
    };
  });
  export default module;