import angular from 'angular';

let module = angular.module('common.services.debounce', []);

module.factory('Debounce', () => {
  return function (cb, time) {
    let timedout = null;
    return function () {
      if (timedout) {
        clearTimeout(timedout);
      }
      timedout = setTimeout(function(){
        cb();
      }, time);
    }
  }
});
export default module;
