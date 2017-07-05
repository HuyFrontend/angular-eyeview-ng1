import angular from 'angular';

let module = angular.module('common.directives.countdown', []);
module.directive('countdown',
  function ($interval) {
    'ngInject';
    return {
      restrict: 'A',
      scope: {
        countdown: '=',
        timeLocal: '=',
        onEndTime: '&'
      },
      link: function ($scope, element, $attrs, ngModel) {
        function pad2(number) {
          return (number < 10 ? '0' : '') + number
        }

        var getTimeRemaining = function (endtime) {
          var t = Date.parse(endtime) - Date.parse(new Date());
          var seconds = Math.floor((t / 1000) % 60);
          var minutes = Math.floor((t / 1000 / 60) % 60);
          var hours = Math.floor((t / (1000 * 60 * 60)));
          return {
            total: t,
            str: '(' + pad2(hours) + ":" + pad2(minutes) + ":" + pad2(seconds) + " s )",
          }
        };
        var intervalTiming = $interval(function () {
          var objRemain = getTimeRemaining($scope.timeLocal);
          if (!(objRemain.total >= 0)) {
            $interval.cancel(intervalTiming);
            $scope.onEndTime && $scope.onEndTime();
          } else {
            element.text(objRemain.str);
          }
        }, 1000);
      }
    };
  });
export default module;

