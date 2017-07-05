import angular from 'angular';

let module = angular.module('common.filters.fileTypeExt', [])
  .filter('fileTypeExt', () => {
    return function (ipt) {
      if (/(ifc|json)/i.test(ipt)) {
        return 'img/icon/file/file.png';
      } else {
        return 'img/icon/file/' + ipt + '.png';
      }
    };
  });
export default module;
