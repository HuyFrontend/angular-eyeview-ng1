import angular from "angular";
import * as _ from "lodash";
import uploadProgressTemplate from "./templates/uploadProgress.html";
import progressTemplate from "./templates/progress.html";
let module = angular.module('common.directives.uploadProgress', []);

module.factory('uploadProgressFactory', ($rootScope,
                                         $q,
                                         $timeout) => {
    'ngInject';
    var services = {};

    /**
     * Indicating if the target is file
     * @param file
     * @returns {boolean}
     * @private
     */
    function _isFile(file) {
      return angular.isDefined(file.name) && angular.isDefined(file.size) && angular.isDefined(file.type);
    }

    services.files = [];

    /**
     * Add file to queue and set default values
     * @param files
     * @returns {*}
     */
    services.add = function (files) {
      var queue = [];

      _.each(files, function (file) {
        services.files.push({
          file: file,
          percentage: 0,
          isUploading: true,
          isCompleted: false,
          isProgressing: false,
          isDone: false,
          isFailed: false,
          /**
           * File uploading progress callback
           * @param evt
           */
          progress: function (evt) {
            var percentage = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            this.percentage = percentage;
            if (percentage === 100) {
              this.isUploading = false;
              this.isCompleted = true;
              this.isProgressing = true;
            }
          },
          /**
           * Make the file as done
           */
          done: function () {
            this.isDone = true;
            $rootScope.$broadcast('uploadProgress.done');
          },
          /**
           * Make the file upload as failed
           */
          fail: function () {
            this.isFailed = true;
            $rootScope.$broadcast('uploadProgress.done');
          }
        });

        queue.push(services.files[services.files.length - 1]);
      });

      $rootScope.$broadcast('uploadProgress.show');

      return queue;
    };

    /**
     * Chain upload
     * @returns {*}
     */
    services.upload = function ($upload, files) {
      var deferred = $q.defer();

      var $files = services.add(files);

      // make the call itself to upload method with parameter
      $upload
        .xhr(function (xhr) {
          _.each($files, function ($file) {
            /**
             * abort file request
             */
            $file.abort = function () {
              xhr.abort();
            };
          });
        })
        .then(function (resp) {
          _.each($files, function ($file) {
            $file.done();
          });
          deferred.resolve(resp.data);
        }, function (err) {
          _.each($files, function ($file) {
            $file.fail();
          });
          deferred.reject(err.data);
        }, function (evt) {
          _.each($files, function ($file) {
            $file.progress(evt);
          });
        });

      return deferred.promise;
    };


    services.showProgress = function (promises, cTotalBlocks) {
      let deferred = $q.defer();
      $rootScope.$broadcast('progress.show');
      services.promises = promises;
      services.cTotalBlocks = cTotalBlocks;
      $q.all(promises).then(() => {
        $timeout(() => {
          $rootScope.$broadcast('progress.hide');
          deferred.resolve();
        }, 1000);
      }, () => {
        $timeout(() => {
          $rootScope.$broadcast('progress.hide');
          deferred.reject();
        }, 1000);
      });
      return deferred.promise;
    };
    /**
     * clear queue
     */
    services.clear = function () {
      $rootScope.$broadcast('uploadProgress.clear');
    };

    /**
     * show upload modal
     */
    services.show = function () {
      $rootScope.$broadcast('uploadProgress.show');
    };

    /**
     * hide upload modal
     */
    services.hide = function () {
      $rootScope.$broadcast('uploadProgress.hide');
    };

    return services;
  }
);

module.directive('uploadProgress', ($timeout,
                                    uploadProgressFactory,
                                    $uibModal) => {
  'ngInject';
  return {
    restrict: 'E',
    controller: [
      '$scope',
      function ($scope) {
        var modalInstance;

        /**
         * clear queue
         */
        function clearFiles() {
          $scope.files.splice(0, $scope.files.length);
        }

        /**
         * Show modal
         */
        function showModal() {
          modalInstance = $uibModal.open({
            animation: true,
            templateUrl: uploadProgressTemplate,
            bindToController: true,
            controllerAs: 'vm',
            keyboard: false, // stop ESC to close
            backdrop: 'static', // stop click to close
            controller: [
              '$scope',
              'uploadProgressFactory',
              '$uibModalInstance',
              function ($scope,
                        uploadProgressFactory,
                        $uibModalInstance) {
                var vm = this;

                /**
                 * Stop all requests
                 */
                function stopRequests() {
                  _.forEach(vm.files, function (file) {
                    if (file.abort) {
                      file.abort();
                    }
                  });
                }

                /**
                 * close modal
                 * @param force
                 */
                function close(force) {
                  // Check if still have file under uploading
                  var flag = _.filter(vm.files, {done: false}).length > 0;
                  if (force === true) {
                    stopRequests();
                    $uibModalInstance.close(null);
                    return;
                  }
                  if (!flag) {
                    $uibModalInstance.close(null);
                  }
                }

                vm.files = uploadProgressFactory.files;
                vm.close = close;

                $scope.$on('uploadProgress.done', function () {
                  close();
                });
              }],
            size: 'md'
          });

          modalInstance.result.then(function () {
            clearFiles();
          }, function () {
            clearFiles();
          });
        }

        function sum(arr) {
          return _.reduce(arr, (m, a) => {
            return m + (a || 0);
          }, 0);
        }

        function showModalProgress() {
          modalInstance = $uibModal.open({
            animation: true,
            templateUrl: progressTemplate,
            bindToController: true,
            controllerAs: 'vm',
            keyboard: false, // stop ESC to close
            backdrop: 'static', // stop click to close
            controller: [
              '$scope',
              'uploadProgressFactory',
              '$uibModalInstance',
              '$timeout',
              function ($scope,
                        uploadProgressFactory,
                        $uibModalInstance,
                        $timeout) {
                var vm = this;
                vm.promises = uploadProgressFactory.promises;
                vm.cTotalBlocks = uploadProgressFactory.cTotalBlocks;
                vm.percentage = 0;
                vm.total = 0;
                vm.unitPercent = 100 / vm.promises.length;
                let counts = [];
                _.each(vm.promises, (p, $idx) => {
                  p.then(() => {
                    // $timeout(() => {
                    //   vm.percentage = 100 * (++vm.total) / vm.cTotalBlocks;
                    // });
                  }, () => {
                  }, (evt) => {
                    $timeout(() => {
                      vm.percentage = 100 * (++vm.total) / vm.cTotalBlocks;
                    });
                  })
                });

                $scope.$on('progress.hide', function () {
                  $uibModalInstance.close(null);
                });
              }],
            size: 'md'
          });

          modalInstance.result.then(function () {
            clearFiles();
          }, function () {
            clearFiles();
          });
        }

        $scope.files = uploadProgressFactory.files;

        $scope.$on('uploadProgress.show', function () {
          showModal();
        });

        $scope.$on('uploadProgress.clear', function () {
          clearFiles();
        });
        $scope.$on('progress.show', function () {
          showModalProgress();
        });
      }],
    /**
     *
     * @param scope
     * @param elem
     * @param attrs
     */
    link: function (scope, elem, attrs) {

    }
  };
});
export default module;
