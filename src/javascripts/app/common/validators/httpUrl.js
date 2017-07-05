import angular from 'angular';

let module = angular.module('common.validators.httpUrl', []);
module.directive('ngHttpUrl', ()=> {
  return {
    require: 'ngModel',
    restrict: 'A',
    link: function (scope, elem, attrs, ngModel) {
      ngModel.$validators.httpUrl = function (value) {
        return /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/.test(value);
      };
    }
  };
});
export default module;
