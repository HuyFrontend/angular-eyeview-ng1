import angular from 'angular';

let module = angular.module('common.directives.download', []);

module.directive('download', ($window,
                              appConstant) => {
  'ngInject';
  return function (scope, element, attrs) {
    element.bind('click', function (e) {
      e.preventDefault();
      if (attrs.href && attrs.href.length) {
        var fileId = attrs.href.substring(attrs.href.lastIndexOf('/') + 1);
        $window.open(appConstant.domain + '/api/' + appConstant.apiVersion + '/download/file?id=' + fileId);
        //$window.open(attrs.href);
      }
    });

    scope.$on('$destroy', function () {
      element.unbind('click');
    });
  };
});
export default module;
