/*@ngInject*/
export default class FileService {
  constructor($q, $http, appConstant) {
    this._$q = $q;
    this._$http = $http;
    this._appConstant = appConstant;
  }

  /**
   * Export file
   * @param data
   * @param headers
   * @param url
   */
  exportFiles(data, headers, url) {
    let octetStreamMime = 'application/octet-stream';
    let success = false;
    let blob;
    // Get the headers
    headers = headers();
    let filename = headers['content-disposition'].substring(21, headers['content-disposition'].length).replace(/"/g, '');
    // Determine the content type from the header or default to "application/octet-stream"
    let contentType = headers['content-type'] || octetStreamMime;

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
        let saveBlob = navigator.webkitSaveBlob || navigator.mozSaveBlob || navigator.saveBlob;
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
      let urlCreator = window.URL || window.webkitURL || window.mozURL || window.msURL;
      if (urlCreator) {
        // Try to use a download link
        let link = document.createElement('a');
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
            let event = document.createEvent('MouseEvents');
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
  }
}
