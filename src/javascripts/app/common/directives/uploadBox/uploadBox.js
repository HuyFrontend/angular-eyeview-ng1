import angular from 'angular';
import * as _ from 'lodash';
import modalCtrl from './controllers/upload.modal';
import template from './templates/uploadBox.html'
let module = angular.module('common.directives.uploadBox', []);
module.controller('uploadModalController', modalCtrl);
module.directive('uploadBox', () => {
  return {
    restrict: 'E',
    templateUrl: template,
    controller: [
      '$scope',
      'googleDriveFactory',
      'boxFactory',
      'dropBoxFactory',
      '$q',
      'fileFactory',
      'toaster',
      'utilFactory',
      function ($scope,
                googleDriveFactory,
                boxFactory,
                dropBoxFactory,
                $q,
                fileFactory,
                toaster,
                utilFactory) {
        var vm = this;

        function changeSource(sourceTarget) {
          vm.source = sourceTarget;
          load(sourceTarget);
        }

        function processGoogleDriveFile(list) {
          return _.map(_.filter(list, function (el) {
            return angular.isDefined(el.downloadUrl) || angular.isDefined(el.exportLinks) || el.mimeType === "application/vnd.google-apps.folder";
          }), function (el) {
            var fileModel = {};
            fileModel.id = el.id;
            fileModel.mimeType = el.mimeType;
            fileModel.name = el.title;
            fileModel.iconLink = el.iconLink;
            fileModel.ext = el.title.indexOf('.') > -1 ? el.title.substring(el.title.indexOf('.') + 1) : 'file';

            if (angular.isDefined(el.downloadUrl)) {
              // File name
              fileModel.fileName = fileModel.name.substring(fileModel.name.lastIndexOf('/') + 1);

              // File extension
              if (el.fileExtension === "") {
                fileModel.ext = 'file';
              }
              else if (el.fileExtension) {
                fileModel.ext = el.fileExtension;
              }
              else {
                fileModel.ext = fileModel.name.substring(fileModel.name.lastIndexOf('.') + 1);
              }
              fileModel.isMultiple = false;

              // File url
              fileModel.downloadUrl = el.downloadUrl;
            }
            else if (angular.isDefined(el.exportLinks)) {
              fileModel.isMultiple = true;
              fileModel.downloadUrls = [];
              for (var k in el.exportLinks) {
                if (el.exportLinks.hasOwnProperty(k)) {
                  var obj = {
                    downloadUrl: el.exportLinks[k],
                    ext: el.exportLinks[k].substr(el.exportLinks[k].lastIndexOf('=') + 1),
                    name: fileModel.name,
                    fileName: fileModel.name.substring(fileModel.name.lastIndexOf('/') + 1) + '.' + el.exportLinks[k].substr(el.exportLinks[k].lastIndexOf('=') + 1)
                  };
                  fileModel.downloadUrls.push(obj);
                }
              }
            }
            else if (el.mimeType === "application/vnd.google-apps.folder") {
              fileModel.ext = "folder";
              fileModel.isFolder = true;
            }

            return fileModel;
          });
        }

        function loadGoogleDriveFiles(q) {

          /**
           * Make request to load files
           */
          function execute() {
            googleDriveFactory.loadFiles(vm.googleDrive.currentQuery.q, vm.googleDrive.currentQuery.nextPageToken)
              .then(function (data) {
                vm.googleDrive.currentQuery.nextPageToken = data.nextPageToken;
                vm.googleDrive.currentQuery.isHaveMore = data.isMore;
                if (data.files.length) {
                  vm.googleDrive.currentQuery.files = vm.googleDrive.currentQuery.files.concat(processGoogleDriveFile(data.files));
                }
                vm.googleDrive.isLoading = false;
                //$scope.$broadcast('content.reload');
              }, function () {
                vm.googleDrive.isLoading = false;
                vm.googleDrive.connect();
              });
          }

          if (vm.googleDrive.isAuth) {
            vm.googleDrive.isLoading = true;
            if (q === 'root') {
              vm.googleDrive.queries = [];
              // Get root folder id
              googleDriveFactory.getRootFolderId()
                .then(function (resp) {
                  // Load root files and folders
                  vm.googleDrive.queries.push({
                    q: "'" + resp.rootFolderId + "' in parents",
                    nextPageToken: null,
                    isHaveMore: true,
                    files: []
                  });
                  vm.googleDrive.currentQuery = vm.googleDrive.queries[vm.googleDrive.queries.length - 1];
                  execute();
                }, function () {
                  // Force clear all Auth status due to unhandle exception
                  vm.googleDrive.isAuth = false;
                  vm.googleDrive.isLoading = false;
                  vm.googleDrive.isValidating = false;
                  vm.googleDrive.queries = [];
                  vm.googleDrive.currentQuery = null;
                });
            } else {
              execute();
            }
          }
        }

        function progressBoxFile(list) {
          return _.map(list, function (el) {
            var fileModel = {};
            //fileModel.mimeType = el.mimeType;
            fileModel.id = el.id;
            fileModel.name = el.name;

            // File name
            fileModel.fileName = fileModel.name.substring(fileModel.name.lastIndexOf('/') + 1);

            // File extension
            fileModel.ext = el.type === 'folder' ? 'folder' : fileModel.name.substring(fileModel.name.lastIndexOf('.') + 1);

            // File url
            fileModel.downloadUrl = 'https://api.box.com/2.0/files/' + el.id + '/content';

            fileModel.isFolder = el.type === 'folder';

            return fileModel;
          });
        }

        function loadBoxFiles(loadMore) {
          if (!vm.box.isAuth) {
            return;
          }
          if (loadMore) {
            vm.box.page = vm.box.page + 1;
          }
          else {
            vm.box.page = 0;
          }
          vm.box.isLoading = true;

          if (!vm.box.queries.length) {
            vm.box.queries.push({
              files: [],
              isHaveMore: true,
              page: 0,
              folderId: 0
            });
            vm.box.currentQuery = vm.box.queries[vm.box.queries.length - 1];
          }

          boxFactory.loadData(vm.box.currentQuery.folderId, vm.box.page * 10, 10)
            .then(function (resp) {
              vm.box.currentQuery.isHaveMore = resp.total_count > ((vm.box.currentQuery.page + 1) * 10);
              vm.box.currentQuery.files = vm.box.currentQuery.files.concat(progressBoxFile(resp.entries));
              vm.box.isLoading = false;
              //$scope.$broadcast('content.reload');
            }, function () {
              vm.box.isLoading = false;
            });
        }

        function progressDropBoxFile(list) {
          return _.map(list, function (el) {
            var fileModel = {};
            fileModel.path = el.path;

            //fileModel.mimeType = el.mimeType;
            fileModel.name = el.path.substring(el.path.lastIndexOf('/') + 1);

            // File name
            fileModel.fileName = fileModel.name;

            // File extension
            fileModel.ext = fileModel.name.substring(fileModel.name.lastIndexOf('.') + 1);

            if (el.is_dir) {
              fileModel.ext = 'folder';
            }

            // File url
            fileModel.downloadUrl = 'https://content.dropboxapi.com/1/files/auto' + el.path;

            fileModel.isFolder = el.is_dir;
            return fileModel;
          });
        }

        function loadDropBoxFiles() {
          if (!vm.dropbox.isAuth) {
            return;
          }
          if (!vm.dropbox.queries.length) {
            vm.dropbox.queries.push({
              files: [],
              path: ''
            });
            vm.dropbox.currentQuery = vm.dropbox.queries[vm.dropbox.queries.length - 1];
          }
          vm.dropbox.isLoading = true;
          dropBoxFactory.loadData(vm.dropbox.currentQuery.path, 100)
            .then(function (resp) {
              vm.dropbox.currentQuery.files = vm.dropbox.currentQuery.files.concat(progressDropBoxFile(resp.contents));
              vm.dropbox.isLoading = false;

              //$scope.$broadcast('content.reload');
            }, function () {
              vm.dropbox.isLoading = false;
            });
        }

        function load(source) {
          switch (source) {
            case 'google':
              if (!vm.googleDrive.currentQuery) {
                loadGoogleDriveFiles('root');
              }
              break;
            case 'box':
              if (!vm.box.currentQuery) {
                loadBoxFiles();
              }
              break;
            case 'dropbox':
              if (!vm.dropbox.currentQuery) {
                loadDropBoxFiles();
              }
              break;
          }
        }

        function upload(file, uploadFileModel) {
          var deferred = $q.defer();
          fileFactory.upload(file, true)
            .progress(function (evt) {
              var progress = parseInt(100.0 * evt.loaded / evt.total);
              uploadFileModel.progress = progress;
              //uploadFileModel.completed = progress === 100;
            })
            .success(function (resp, status, headers, config) {
              uploadFileModel.filePath = resp.fileUrl;
              uploadFileModel.completed = true;
              deferred.resolve();
            })
            .error(function (err) {
              deferred.reject(err);
            })
            .xhr(function (xhr) {
              uploadFileModel.abort = function () {
                xhr.abort();
              };
            });

          return deferred.promise;
        }

        function validateFile(file) {
          var isValidFileType = true;
          var isValidMaxSize = true;
          if (vm.fileTypes) {
            if (file.name) {
              var fileExtension = file.name.substring(file.name.lastIndexOf('.') + 1);
              if (fileExtension) {
                var validTypes = vm.fileTypes.indexOf(',') > -1 ? vm.fileTypes.split(',') : [vm.fileTypes];
                validTypes = validTypes.map(function (el) {
                  return el.trim();
                });
                var typeReg = new RegExp("(" + validTypes.join('|') + ")", "i");
                isValidFileType = typeReg.test(fileExtension);
              }
              else {
                isValidFileType = false;
              }
            }
            else {
              isValidFileType = false;
            }
          }
          if (!isValidFileType) {
            toaster.pop('info', 'File type unacceptable', 'Only accept file types: ' + vm.fileTypes);
          }
          if (vm.maxSize) {
            var total = file.size;
            _.each(vm.uploadFiles, function (f) {
              total += f.size;
            });
            if (total > vm.maxSize) {
              isValidMaxSize = false;
              toaster.pop('info', 'File size is exceeded', 'Only accept file size < ' + vm.maxSize / 1048576 + 'Mb');
            }
          }
          return isValidFileType && isValidMaxSize;
        }

        function isUploading() {
          var flag = false;
          for (var i = 0; i < vm.uploadFiles.length; i++) {
            var file = vm.uploadFiles[i];
            if (file.progress !== 100 || !file.completed) {
              flag = true;
              break;
            }
          }
          return flag;
        }

        function removeFile() {
          this.abort();
          _.remove(vm.uploadFiles, {id: this.id});
        }

        function clearFiles() {
          vm.uploadFiles = [];
        }

        vm.uploadFiles = angular.isDefined(vm.uploadFiles) ? vm.uploadFiles : [];
        vm.multiple = angular.isDefined(vm.multiple) ? vm.multiple : true;
        vm.fileTypes = angular.isDefined(vm.fileTypes) ? vm.fileTypes : '';
        vm.maxSize = angular.isDefined(vm.maxSize) ? vm.maxSize : '';
        vm.fileAcceptTypes = (vm.fileTypes.length && '.' || '').concat(vm.fileTypes.split(',').join(',.'));
        vm.source = 'local';
        vm.changeSource = changeSource;
        vm.googleDrive = {
          isAuth: googleDriveFactory.isAuth(),
          isLoading: false,
          isValidating: false,
          queries: [],
          currentQuery: null,
          browse: function (item) {
            this.queries.push({
              q: "'" + item.id + "' in parents",
              nextPageToken: null,
              isHaveMore: true,
              files: [],
              name: item.name
            });
            this.currentQuery = this.queries[this.queries.length - 1];
            loadGoogleDriveFiles();
          },
          connect: function () {
            this.isLoading = false;
            this.isValidating = true;
            this.isAuth = false;
            googleDriveFactory.authorize()
              .then(function () {
                vm.googleDrive.isAuth = true;
                loadGoogleDriveFiles('root');
              });
          },
          back: function () {
            // Remove last item
            this.queries.splice(-1, 1);
            this.currentQuery = this.queries[this.queries.length - 1];
          },
          download: function (item) {
            if (validateFile(item)) {
              vm.uploadFiles.push({
                size: item.size,
                progress: 100,
                fileName: item.fileName,
                filePath: '',
                completed: false,
                extension: item.fileName.substring(item.fileName.lastIndexOf('.') + 1).toLowerCase()
              });
              var file = vm.uploadFiles[vm.uploadFiles.length - 1];
              googleDriveFactory.downloadFile(item.downloadUrl, item.fileName)
                .success(function (resp) {
                  file.completed = true;
                  file.filePath = resp.fileUrl;
                });
            }
          },
          loadGoogleDriveFiles: loadGoogleDriveFiles
        };
        vm.dropbox = {
          isAuth: dropBoxFactory.isAuth(),
          isLoading: false,
          queries: [],
          currentQuery: null,
          browse: function (item) {
            this.queries.push({
              files: [],
              path: item.path,
              name: item.fileName
            });
            this.currentQuery = this.queries[this.queries.length - 1];
            loadDropBoxFiles();
          },
          connect: function () {
            dropBoxFactory.authorize()
              .then(function () {
                vm.dropbox.isAuth = true;
                loadDropBoxFiles();
              });
          },
          back: function () {
            // Remove last item
            this.queries.splice(-1, 1);
            this.currentQuery = this.queries[this.queries.length - 1];
          },
          download: function (item) {
            if (validateFile(item)) {
              vm.uploadFiles.push({
                size: item.size,
                progress: 100,
                fileName: item.fileName,
                filePath: '',
                completed: false,
                extension: item.fileName.substring(item.fileName.lastIndexOf('.') + 1).toLowerCase()
              });
              var file = vm.uploadFiles[vm.uploadFiles.length - 1];
              dropBoxFactory.downloadFile(item.downloadUrl, item.fileName)
                .success(function (resp) {
                  file.completed = true;
                  file.filePath = resp.fileUrl;
                });
            }
          }
        };
        vm.box = {
          isAuth: boxFactory.isAuth(),
          isLoading: false,
          queries: [],
          currentQuery: null,
          browse: function (item) {
            this.queries.push({
              files: [],
              isHaveMore: true,
              page: 0,
              folderId: item.id,
              name: item.fileName
            });
            this.currentQuery = this.queries[this.queries.length - 1];
            loadBoxFiles();
          },
          connect: function () {
            boxFactory.authorize()
              .then(function () {
                vm.box.isAuth = true;
                loadBoxFiles();
              });
          },
          back: function () {
            // Remove last item
            this.queries.splice(-1, 1);
            this.currentQuery = this.queries[this.queries.length - 1];
          },
          download: function (item) {
            if (validateFile(item)) {
              vm.uploadFiles.push({
                size: item.size,
                progress: 100,
                fileName: item.fileName,
                filePath: '',
                completed: false,
                extension: item.fileName.substring(item.fileName.lastIndexOf('.') + 1).toLowerCase()
              });
              var file = vm.uploadFiles[vm.uploadFiles.length - 1];
              boxFactory.downloadFile(item.downloadUrl, item.fileName)
                .success(function (resp) {
                  file.completed = true;
                  file.filePath = resp.fileUrl;
                });
            }
          },
          loadBoxFiles: loadBoxFiles
        };
        vm.upload = upload;
        vm.isUploading = isUploading;

        $scope.$watch(function () {
            return vm.files;
          },
          function (files) {
            if (angular.isArray(files)) {
              _.each(files, function (file) {
                if (validateFile(file)) {
                  if (!vm.multiple) {
                    clearFiles();
                  }
                  vm.uploadFiles.push({
                    size: file.size,
                    id: utilFactory.makeId(10),
                    progress: 0,
                    fileName: file.name,
                    filePath: '',
                    completed: false,
                    extension: file.name.substring(file.name.lastIndexOf('.') + 1).toLowerCase(),
                    remove: removeFile
                  });
                  upload(file, vm.uploadFiles[vm.uploadFiles.length - 1]);
                }
              });
            }
            else if (angular.isDefined(files) && files !== null) {
              if (validateFile(files)) {
                if (!vm.multiple) {
                  clearFiles();
                }
                vm.uploadFiles.push({
                  size: files.size,
                  id: utilFactory.makeId(10),
                  progress: 0,
                  fileName: files.name,
                  filePath: '',
                  completed: false,
                  extension: files.name.substring(files.name.lastIndexOf('.') + 1).toLowerCase(),
                  remove: removeFile
                });
                upload(files, vm.uploadFiles[vm.uploadFiles.length - 1]);
              }
            }
          });
      }],
    controllerAs: 'vm',
    scope: {
      uploadFiles: '=', // model
      multiple: '=',  // true/false
      fileTypes: '=', // e.g: jpg,jpeg,png or empty
      maxSize: '=?', // number, bytes value
      isUploading: '='
    },
    bindToController: true, // because the scope is isolated
    link: function () {

    }
  }
});
export default module;
