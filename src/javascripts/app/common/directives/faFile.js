import angular from 'angular';

let module = angular.module('common.directives.faFile', []);
module.directive('faFile', ($timeout) => {
  'ngInject';
  return {
    restrict: 'E',
    scope: {
      mimetype: '='
    },
    controller: [
      '$scope',
      function ($scope) {
        let vm = this;

        switch ($scope.mimetype) {
          case 'image/gif':
          case 'image/jpeg':
          case 'image/png':
          case 'application/x-shockwave-flash':
          case 'image/psd':
          case 'image/bmp':
          case 'image/tiff':
          case 'image/jp2':
          case 'image/iff':
          case 'image/vnd.wap.wbmp':
          case 'image/xbm':
          case 'image/vnd.microsoft.icon':
            vm.icon = `file-image-o`;
            break;
          case 'video/x-flv':
          case 'video/mp4':
          case 'application/x-mpegURL':
          case 'video/MP2T':
          case 'video/3gpp':
          case 'video/quicktime':
          case 'video/x-msvideo':
          case 'video/x-ms-wmv':
            vm.icon = `file-video-o`;
            break;
          case 'application/msword':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.template':
          case 'application/vnd.ms-word.document.macroEnabled.12':
          case 'application/vnd.ms-word.template.macroEnabled.12':
            vm.icon = `file-word-o`;
                break;
          case 'application/vnd.ms-excel':
          case 'application/vnd.ms-excel':
          case 'application/vnd.ms-excel':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.template':
          case 'application/vnd.ms-excel.sheet.macroEnabled.12':
          case 'application/vnd.ms-excel.template.macroEnabled.12':
          case 'application/vnd.ms-excel.addin.macroEnabled.12':
          case 'application/vnd.ms-excel.sheet.binary.macroEnabled.12':
            vm.icon = `file-excel-o`;
                break;
          case 'application/vnd.ms-powerpoint':
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          case 'application/vnd.openxmlformats-officedocument.presentationml.template':
          case 'application/vnd.openxmlformats-officedocument.presentationml.slideshow':
          case 'application/vnd.ms-powerpoint.addin.macroEnabled.12':
          case 'application/vnd.ms-powerpoint.presentation.macroEnabled.12':
          case 'application/vnd.ms-powerpoint.template.macroEnabled.12':
          case 'application/vnd.ms-powerpoint.slideshow.macroEnabled.12':
            vm.icon = `file-powerpoint-o`;
            break;
          case 'application/pdf':
            vm.icon = `file-pdf-o`;
            break;
          case 'text/html':
          case 'application/json':
            vm.icon = `file-code-o`;
            break;
          case 'application/gzip':
          case 'application/zip':
            vm.icon = `file-archive-o`;
            break;
          case 'application/octet-stream':
            vm.icon = `file-o`;
            break;
          case 'text/plain':
          default:
            vm.icon = 'file-text-o';
            break;
        }

      }
    ],
    controllerAs: 'vm',
    template: `<i class="fa fa-{{vm.icon}}"></i>`
  };
});
export default module;
