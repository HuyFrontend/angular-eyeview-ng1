import angular from 'angular';

let module = angular.module('common.filters.fileSize', [])
  .filter('fileSize', () => {
    return function (size) {
      if (isNaN(size))
        size = 0;

      if (size < 1024)
        return size + ' Byte'+(size>1?'s':'');

      size /= 1024;

      if (size < 1024)
        return size.toFixed(2) + ' KB';

      size /= 1024;

      if (size < 1024)
        return size.toFixed(2) + ' MB';

      size /= 1024;

      if (size < 1024)
        return size.toFixed(2) + ' GB';

      size /= 1024;

      return size.toFixed(2) + ' TB';
    };
  });
export default module;

