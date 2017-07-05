import referenceTypes from "app/common/resources/referenceTypes.json";
import moment from "moment";

class Controller {
  /*@ngInject*/
  constructor(
    $rootScope,
    $scope,
    $filter,
    $timeout,
    ResourceService,
    toaster,
    appConstant,
    userContext,
    $window,
    GoldenLayoutService,
    PointService,
    CameraService,
    $uibModal,
    OverlayLoaderService,
    utilFactory,
    notifications
  ) {
    let self = this;

    // Declare dependencies
    self._$rootScope = $rootScope;
    self._$scope = $scope;
    self._$filter = $filter;
    self._$timeout = $timeout;
    self._resourceService = ResourceService;
    self._toaster = toaster;
    self._appConstant = appConstant;
    self._userContext = userContext;
    self._moment = $window.moment;
    self._goldenLayoutService = GoldenLayoutService;
    self._btsService = CameraService;
    self._pointService = PointService;
    self._$uibModal = $uibModal;
    self._overlayLoaderService = OverlayLoaderService;
    self._utilFactory = utilFactory;
    self._notifications = notifications;

    // declare parent data from network map
    self._container = self._$scope.$parent.container;
    self._state = self._$scope.$parent.state;

    self._latlng = self._state.data.latlng;
    self._model = self._state.data.model;
    self._typeView = self._state.data.typeView;
    self._layer = self._state.data.layer;
    self._map = self._state.map;
    self.tabsetScrollAPI = null;

    // This function will be used to set when a miji marker added to map

    // Declare default variables
    self._latlng = self._latlng || {
      lat: "",
      lng: ""
    };
    self._type = 1;
    self._orientation = "horizontal";
    self._masterSitesList = [];
    self._enableExport = true;
    self._$scope.listCamera = [];
    self._$scope.listCameraRecord = [];
    self._$scope.model = self._model;
    self._numberRecordToTake = 10;
    self._currentRecordIndex = 0;
    self._$scope.currentCamera = {};
    self._$scope.currentRecord = {};
    self._$scope.isCameraStreaming = true;
    self._momentTimeFormat = "YYYY-MM-DD HH:mm:ss";
    self._inputTimeFormat = "DD/MM/YYYY HH:mm";
    self._$scope.isRecord = false;
    self._$scope.isShowMore = true;
    // generate ajax loader name
    self._overlayLoaderName = `viewcamera_${self._utilFactory.makeId(100)}`;

    // Call initialize function to reload first data
    self.setModel();

    // handle close tab
    self._container.onClose = (contentItem, cb) => {
      self.showConfirm(contentItem, cb);
    };

    self.setModeDisplay(self._model, self._typeView);
    //URL for main video frame

    /**
     * Set main camera
     */
    self._$scope.urlPlay = `null`;

    /**
     * User select camera streaming
     */
    self._$scope.selectLiveCamHandle = cam => {
      //set flag when is streaming from camera
      self._$scope.isCameraStreaming = true;

      //set selected camera to scope (global varible)
      self._$scope.currentCamera = cam;

      //start streaming video from selected camera
      self.setURLMainVideo(cam.liveStreamUrl);

      // fire event when main frame (big frame video) is playing
      self._$scope.$broadcast("mainFrameisActived", cam);
    };

    /**
     * User select recorded video
     */
    self._$scope.selectRecordedVideoHandle = record => {
      //set flag when is streaming from camera
      self._$scope.isCameraStreaming = false;

      //Set current record
      self._$scope.currentRecord = record;

      //start streaming video from selected camera
      self.setURLMainVideo(record.videoUrl);

      // fire event when main frame (big frame video) is playing
      self._$scope.$broadcast("mainFrameisActived", record);
    };

    self._$scope.setURLMainVideo = src => self.setURLMainVideo(src);
    self._$scope.fetchMoreRecord = () => {
      self.fetchCameraRecord(self._model.pointid);
    };
    self._$scope.searchVideoRecord = () => {
      self.searchCameraRecord();
    };
  }

  /**
   * Set main camera
   */
  setURLMainVideo = src => {
    this._$scope.urlPlay = src;
  };

  /**
   * Set display mode for camera view or person view
   */
  setModeDisplay(point, typeView) {
    let modeDisplay = ["point", "person", "drone"];
    //check type of view
    if (modeDisplay.indexOf(typeView) === -1)
      throw new Error(`Type of view ${typeView} is not support`);
    //Config view for type of view
    let config = {
      pointView: {
        listCamera: true,
        listRecord: true
      },
      personView: {
        listCamera: false,
        listRecord: false
      },
      droneView: {
        listCamera: false,
        listRecord: false
      }
    };
    if (typeView === "point") this._$scope.modeDisplay = config.pointView;
    else if (typeView === "person")
      this._$scope.modeDisplay = config.personView;
    else if (typeView === "drone") this._$scope.modeDisplay = config.droneView;

    this.fetchCameraData(point.pointid);
    this.fetchCameraRecord(point.pointid);
  }

  /**
   * Fetch camera data
   */
  fetchCameraData(pointId) {
    this._pointService
      .getCamerasOfPoint(pointId)
      .then(res => {
        this._$scope.listCamera = res.data || [];
        this.setURLMainVideo(res.data[0].liveStreamUrl);
      })
      .catch(er => console.error(`Error when fetch camera data ${er}`));
  }

  createSearchParams() {
    let startDate = this._$scope.startDate;
    let endDate = this._$scope.endDate;

    if (startDate && startDate.length > 0) {
      startDate = moment(startDate, this._inputTimeFormat).format(
        this._momentTimeFormat
      );
    }
    if (endDate && endDate.length > 0) {
      endDate = moment(endDate, this._inputTimeFormat).format(
        this._momentTimeFormat
      );
    }

    let searchParams = {
      keyword: this._$scope.searchName || null,
      startDateUtc: startDate,
      endDateUtc: endDate
    };
    return searchParams;
  }

  /**
   * search camera records by name, start and end date of record
   */
  searchCameraRecord() {
    let pointId = this._model.pointid;
    let take = this._numberRecordToTake;
    let skip = 0;
    let searchParams = this.createSearchParams();

    this._$scope.listCameraRecord = [];
    this._currentRecord = 0;

    if (
      typeof pointId !== "undefined" &&
      pointId != null &&
      pointId.length > 0
    ) {
      this._pointService
        .getRecordedVideoOfPoint(pointId, searchParams, take, skip)
        .then(res => {
          if (res.data && res.data.recordedVideos) {
            let numOfVideos = res.data.recordedVideos.length;
            if (numOfVideos > 0) {
              this.showMessengeResult(false);
              this._currentRecord = numOfVideos;
              this._$scope.listCameraRecord = this._$scope.listCameraRecord.concat(
                res.data.recordedVideos
              );
            } else {
              this.showMessengeResult(true);
            }
          }
        })
        .catch(er => console.error(`Error when search video record ${er}`));
    }
  }

  showMessengeResult(type) {
    if (type) {
      this._$scope.isRecord = true;
      this._$scope.isShowMore = false;
    } else {
      this._$scope.isRecord = false;
      this._$scope.isShowMore = true;
    }
  }

  /**
   * Fetch camera records
   */
  fetchCameraRecord(pointId) {
    let take = this._numberRecordToTake;
    let skip = this._currentRecordIndex;
    let searchParams = this.createSearchParams();

    this._pointService
      .getRecordedVideoOfPoint(pointId, searchParams, take, skip)
      .then(res => {
        if (res.data && res.data.recordedVideos) {
          let numOfVideos = res.data.recordedVideos.length;
          if (numOfVideos > 0) {
            this.showMessengeResult(false);
            this._currentRecord = this._currentRecord + numOfVideos;
            this._$scope.listCameraRecord = this._$scope.listCameraRecord.concat(
              res.data && res.data.recordedVideos
            );
          } else {
            this.showMessengeResult(true);
          }
        }
      })
      .catch(er => console.error(`Error when fetch camera record ${er}`));
  }

  /**
   * Set default data for camera model. It called when component is opened
   */
  setModel() {
    let self = this;

    self._camera = {
      id: "",

      externalNotification: false,
      latitude: self._latlng.lat.toString(),
      longitude: self._latlng.lng.toString()
    };

    if (self._model) {
      self._camera = angular.copy(self._model);
    }

    // Setup and convert data if editing
    if (self._camera.id) {
    } else {
      // self.bindAddress();
    }
    // Used for tab message
    self._$scope.state = {
      itemData: self._camera,
      messageFor: "",
      container: self._container
    };
  }

  /**
   * Close form
   */
  closeForm() {
    let self = this;
    // Close tab
    let tab = self._container.tab.contentItem;
    tab.remove();
  }

  /**
   * On container resized
   * @private
   */
  _onContainerResized() {
    let self = this;
    // Recalculate scroll
    // Reference: https://github.com/VersifitTechnologies/angular-ui-tab-scroll#api
    self.tabsetScrollAPI &&
      self.tabsetScrollAPI.doRecalculate &&
      self.tabsetScrollAPI.doRecalculate();
  }

  $onInit() {
    let self = this;
    self._overlayLoader = self._overlayLoaderService.init(
      self._overlayLoaderName
    );
    self._container.on("resize", self._onContainerResized.bind(self));
  }

  _destroyEvents() {
    let self = this;
    self._overlayLoaderService.destroy(self._overlayLoaderName);
    self._container.off("resize");
  }

  $onDestroy() {
    let self = this;
    self._destroyEvents();
  }

  showConfirm(contentItem, cb) {
    let self = this;
    let currentTab = self._container.tab.contentItem;
    // Dirty checking

    self._destroyEvents();
    if (contentItem) {
      contentItem.remove();
    } else {
      currentTab.remove();
    }
    cb && cb();
    return;
  }
}

export default Controller;
