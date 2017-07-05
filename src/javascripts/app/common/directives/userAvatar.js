import angular from 'angular';

let module = angular.module('common.directives.userAvatar', []);
module.directive('userAvatar', ($timeout,
                                notifications,
                                $document) => {
  'ngInject';
  function linkFn(scope, elem, attrs, ngModel) {
    function reloadImage() {
      var img = $document[0].createElement('img');

      img.onload = function () {
        var $this = this;
        elem.attr("src", $this.src);
      };

      img.onerror = function () {
        elem.attr("src", '/assets/images/default-avatar.png');
      };

      img.src = scope.userAvatar;
    }

    reloadImage();
    attrs.$observe('userAvatar', reloadImage)
  }

  return {
    restrict: 'A',
    link: linkFn,
    scope: {
      userAvatar: '@'
    }
  };
});
export default module;
