import angular from 'angular';

let module = angular.module('common.services.file', []);

module.factory('fileFactory', (Upload,
                               appConstant) => {
    'ngInject';
    var service = {};

    service.upload = function (file, ignoreLoadingBar) {
      return Upload.upload({
        url: appConstant.domain + '/api/' + appConstant.apiVersion + '/common/upload/file',
        file: file,
        headers: {
          'Authorization': false
        },
        ignoreLoadingBar: ignoreLoadingBar
      });
    };

    service.uploadSpreadSheet = function (file, type, id) {
      return Upload.upload({
        url: appConstant.domain + '/api/' + appConstant.apiVersion + '/wizard/upload',
        file: file,
        headers: {
          'Authorization': false
        },
        data: {
          'type': type,
          'id': id
        },
        ignoreLoadingBar: true
      });
    };

    service.uploadSpreadSheetNew = function (file, type, libraryName, id) {
      return Upload.upload({
        url: appConstant.domain + '/api/' + appConstant.apiVersion + '/wizard/upload',
        file: file,
        headers: {
          'Authorization': false
        },
        data: {
          libraryName: libraryName,
          type: type,
          id: id
        },
        ignoreLoadingBar: true
      });
    };

    /**
     * Export file
     * @param data
     * @param headers
     * @param url
     */
    service.exportFiles = function (data, headers, url) {
      var octetStreamMime = 'application/octet-stream';
      var success = false;
      var blob;
      // Get the headers
      headers = headers();
      var filename = headers['content-disposition'].substring(21, headers['content-disposition'].length).replace(/"/g, '');
      // Determine the content type from the header or default to "application/octet-stream"
      var contentType = headers['content-type'] || octetStreamMime;

      try {
        // Try using msSaveBlob if supported
        blob = new Blob([data], {
          type: contentType
        });
        if (navigator.msSaveBlob) {
          navigator.msSaveBlob(blob, filename);
        }
        else {
          // Try using other saveBlob implementations, if available
          var saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
          if (saveBlob === undefined) {
            throw "Not supported";
          }
          saveBlob(blob, filename);
        }
        success = true;
      } catch (ex) {
      }
      if (!success) {
        // Get the blob url creator
        var urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
        if (urlCreator) {
          // Try to use a download link
          var link = document.createElement('a');
          if ('download' in link) {
            // Try to simulate a click
            try {
              // Prepare a blob URL
              blob = new Blob([data], {
                type: contentType
              });
              url = urlCreator.createObjectURL(blob);
              link.setAttribute('href', url);

              // Set the download attribute (Supported in Chrome 14+ / Firefox 20+)
              link.setAttribute("download", filename);

              // Simulate clicking the download link
              var event = document.createEvent('MouseEvents');
              event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
              link.dispatchEvent(event);
              success = true;

            } catch (ex) {
            }
          }

          if (!success) {
            // Fallback to window.location method
            try {
              // Prepare a blob URL
              // Use application/octet-stream when using window.location to force download
              blob = new Blob([data], {
                type: octetStreamMime
              });
              //url = urlCreator.createObjectURL(blob);
              window.location = url;
              //saveAs(blob, filename);
              success = true;
            } catch (ex) {
            }
          }
        }
      }
    };

    return service;
  }
);
export default module;
