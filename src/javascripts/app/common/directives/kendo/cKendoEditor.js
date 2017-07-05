import angular from 'angular';

let module = angular.module('common.directives.cKendoEditor', []);
module.directive('cKendoEditor', (appConstant) => {
  'ngInject';
  function linkFn(scope, elem) {
    var $editorElem = elem.children(), instance;
    instance = $editorElem.kendoEditor(scope.vm.options).data("kendoEditor");
    scope.vm.instance = instance;
    var editorBody = angular.element(instance.body), dropAtChildIndex = 0;

    function showUploadingSpin() {
      editorBody.append('<div id="uploading-spin" style="position: fixed; z-index: 11000; width: 100%; height: 100%; top: 0; left: 0; background: rgba(0,0,0,0.3);">' +
        '<div class="loading-text" style="text-align: center; position: absolute; top:50%; height: 50%; width: 100%;">Please wait, the file is being uploaded...</div>' +
        '</div>');
    }

    function hideUploadingSpin() {
      editorBody.find('#uploading-spin').remove();
    }

    function FileDragOver(e) {
      dropAtChildIndex = angular.element(e.target).index();
    }

    function FileSelectHandler(e) {
      e.preventDefault();
      //console.log('Drop', e.dataTransfer.files[0].name);

      var formData = new FormData();
      formData.append('file', e.dataTransfer.files[0]);
      //for (var i = 0; i < e.dataTransfer.files.length; i++) {
      //  formData.append('file', e.dataTransfer.files[i]);
      //}

      // now post a new XHR request
      var xhr = new XMLHttpRequest();
      xhr.open('POST', appConstant.domain + '/api/' + appConstant.apiVersion + '/common/upload/file');
      xhr.onload = function () {
        hideUploadingSpin();
        if (xhr.status === 200) {
          var res = angular.fromJson(xhr.response);

          var range = document.createRange();

          if (instance.body.childNodes[dropAtChildIndex]) {
            range.setStart(instance.body.childNodes[dropAtChildIndex], 0);
          }

          if (/(jpg|jpeg|png|gif|bmp)/i.test(res.fileName.substring(res.fileName.lastIndexOf('.') + 1))) {
            // image
            instance.exec("inserthtml", {
              value: "<img style='max-width: " + (instance.body.clientWidth - 20) + "px' src='" + res.fileUrl + "' />",
              range: range
            });
          }
          else {
            // insert link
            instance.exec("inserthtml", {
              value: "<a href='" + res.fileUrl + "' target='_blank'>" + res.fileName + "</a>",
              range: range
            });
          }
        }
      };

      showUploadingSpin();

      xhr.send(formData);
    }

    instance.body.addEventListener("dragover", FileDragOver, false);
    instance.body.addEventListener("drop", FileSelectHandler, false);

    scope.$on('$destroy', function () {
      instance.body.removeEventListener("dragover", FileDragOver, false);
      instance.body.removeEventListener("drop", FileSelectHandler, false);
    });
  }

  function controllerFn() {

  }

  return {
    restrict: 'E',
    link: linkFn,
    controller: controllerFn,
    bindToController: true,
    controllerAs: 'vm',
    template: '<textarea></textarea>',
    scope: {
      instance: '=',
      options: '=',
      model: '='
    }
  };
});
export default module;
