import referenceTypes from "app/common/resources/referenceTypes.json";

class Controller {
  /*@ngInject*/
  constructor($rootScope, $scope, $attrs, $timeout, $document) {
    let self = this;
    self._$scope = $scope;
    self._$rootScope = $rootScope;
    self._$timeout = $timeout;
    self._$document = $document;
    self._$scope.hlsError = false;
    self._$scope.statusFrame = null;
    self._$scope.objHls = {};
    self._$scope.detachHls = null;
    self._$scope.detachVideo = null;

    //GLOBAL CONFIG
    self.config = {
      //STATUS FOR PLAYER FRAME
      statusFrame: {
        LOADING: "LOADING",
        ERROR: "ERROR",
        PLAYING: "PLAYING",
        PAUSE: "PAUSE"
      }
    };

    $timeout(() => {
      self._cameraName = $attrs.name;
      self._cameraID = $attrs.id;
      self._cameraURL = $attrs.url;
      self._mainCameraURL = $attrs.streamingUrl;

      self._$scope.cameraName = self._cameraName;
      self._$scope.cameraID = self._cameraID;
    });

    angular.element(document).ready(function() {
      self.changeStatusFrame();
      self.attachStreaming(
        self._cameraID,
        self._cameraURL,
        self._mainCameraURL
      );
    });

    self._$scope.$on("mainFrameisActived", function(event, args) {
      let cameraId = args.cameraId;
      let hls = self._hlsObj;

      if (hls && cameraId !== self._cameraID) {
        hls.startLoad();
        self.changeStatusFrame(self.config.statusFrame.PLAYING);
      }
      if (hls && cameraId === self._cameraID) {
        hls.stopLoad();
        self.changeStatusFrame(self.config.statusFrame.PAUSE);
      }
    });
  }

  changeStatusFrame(status = this.config.statusFrame.LOADING) {
    this._$scope.statusFrame = status;
  }

  attachStreaming(cameraID, cameraURL, mainCameraURL) {
    if (Hls.isSupported()) {
      let video = $("#video-" + cameraID)[0];
      let hls = new Hls();

      hls.loadSource(cameraURL);
      //
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
        this.changeStatusFrame(this.config.statusFrame.PLAYING);
      });

      //save hls to this context
      this._hlsObj = hls;

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
          hls.destroy();
          this._hlsObj = null;
          this.changeStatusFrame(this.config.statusFrame.ERROR);
          this._$scope.$apply();
        }
      });
    }
  }
}

export default Controller;
