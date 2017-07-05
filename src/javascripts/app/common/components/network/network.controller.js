import * as _ from "lodash";
import JOB_STATUS from "app/common/resources/jobStatus.json";

class Controller {
  /*@ngInject*/
  constructor(
    $q,
    $scope,
    $timeout,
    $rootScope,
    $compile,
    userContext,
    $ocLazyLoad,
    ResourceService,
    MarkupService,
    appConstant,
    FileService,
    CameraService,
    PointService,
    GoldenLayoutService,
    localStorageService,
    $location,
    confirmationFactory,
    toaster,
    Debounce,
    accountFactory,
    OverlayLoaderService,
    SocketIOService,
    $log
  ) {
    let self = this;
    // Declare dependencies
    self._$q = $q;
    self._$scope = $scope;
    self._$timeout = $timeout;
    self._$rootScope = $rootScope;
    self._$compile = $compile;
    self._$ocLazyLoad = $ocLazyLoad;
    self._$location = $location;

    self._userContext = userContext;
    self._appConstant = appConstant;
    self._resourceService = ResourceService;
    self._markupService = MarkupService;
    self._fileService = FileService;
    self._btsService = CameraService;
    self._pointService = PointService;
    self._goldenLayoutService = GoldenLayoutService;
    self._storage = localStorageService;
    self._confirmDialogService = confirmationFactory;
    self._toaster = toaster;
    self._accountFactory = accountFactory;
    self._overlayLoaderService = OverlayLoaderService;
    self.SocketIOService = SocketIOService;
    self.$log = $log;

    self._redrawMapBouncing = new Debounce(function() {
      self._$timeout(() => self._map.invalidateSize());
      self.redrawMap(); // clear markers on map
    }, 100);
    // declare default data
    self._hiddenFOVStatus = false;
    self._mapViewMode = null;
    self._cctvSearchConfig = {};
    self._map = null;
    self._container = self._$scope.$parent.container;
    self._state = self._$scope.$parent.state;
    self._minZoom = 10;
    self._maxZoom = 18;
    self._defaultZoom = 16;

    //Map view mode
    self.VIEWMODE = {
      SEARCH: "SEARCH",
      NORMAL: "NORMAL"
    };

    //Brisbane - Defaul location
    self._defaultLoc = new L.LatLng(-27.47194, 153.018554);
    self._drawnItems = [];
    self._token = self._userContext.auth().token;

    self._enableSearchAddress = self._state.enableSearchAddress;
    self._enableRuler = self._state.enableRuler;
    self._enablePolygon = self._state.enablePolygon;
    self._enableSearchCamera = self._state.enableSearchCamera;

    // Setup default data for L.NETWORK
    L.NETWORK = {
      DRONES: [],
      CAMERAES: [],
      CLUSTERS: {
        CAMERAES: []
      }
    };

    L.NETWORK.CONSTANT = {
      operator: self._$rootScope.userOperator,
      operatorId:
        self._$rootScope.userOperator &&
          self._$rootScope.userOperator.operatorId,
      domain: self._appConstant.domain,
      version: self._appConstant.apiVersion,
      token: self._token,
      jobId: self._$rootScope.currentUserInfo.selectedJobId
    };

    // Load source data and add to L.NETWORK
    L.NETWORK.DATAFIELDS = self._resourceService.getDataFields();
    L.NETWORK.CELLTYPES = self._resourceService.getCellTypes();
    L.NETWORK.MARKUPTYPES = self._resourceService.getMarkupTypes();
    L.NETWORK.CAMTYPE = {
      CLUSTER: 1,
      CAM: 2
    };

    L.NETWORK.DATA_IMPORT_STATUS = self._resourceService.getImportDataStatus();
    /**
     * CELL/MIJI/UTI POPUP EXCEPT FIELDS: Array of cell fields that do not display to "cell popup"
     *
     * See: - app/vendors/leaflet/Leaflet.Cell.js --> _openPopupInfo()
     *      - src/app/main/resources/cellPopupExceptFields.json
     */
    L.NETWORK.CELLPOPUPEXCEPTFIELDS = self._resourceService.getCellPopupExceptFields();
    L.NETWORK.CAMERAPOPUPEXCEPTFIELDS = self._resourceService.getCameraPopupExceptFields();
    L.NETWORK.COLUMN_CONVERSION = self._resourceService.getColumnConversion();
    L.NETWORK.FIELDS = self._resourceService.getFields();

    L.NETWORK.SELECTEDCELL = null;
    L.NETWORK.HIGHLIGHT_ITEMS = null; //store alarm info in cell
    /**
     * This flag is used when click to a cam marker on map
     * - Is not null: when focus map     See: setFocus() - app/vendors/leaflet/Leaflet.Camera.js
     * - Is null: when click outside
     */
    L.NETWORK.ACTIVECAMERA = null;

    //Event: Search cctv
    //TODO
    self._$rootScope.$on("searchCctvEvent", (e, data) => {
      let task = data.task;
      let payload = data.payload;
      switch (task) {
        case "search":
          self.searchCctv(payload);
          break;
        case "focus":
          self.focusCctvPoint(payload);
          break;
        case "closeSearch":
          self.closeCctvSearch();
          break;
        case "toggleLocationReload":
          self.changCctvSearchConfig(payload);
          break;
        case "showNext":
          self.searchCctv(payload);
          break;
        case "showPrev":
          self.searchCctv(payload);
          break;
      }
    });

    // Event: Golden layout resize
    self.goldenLayoutSizeChanged = self._$rootScope.$on(
      "goldenLayoutSizeChanged",
      () => {
        if (self._map) {
          self._map.invalidateSize();
        }
      }
    );
    self.SocketIOService.socket &&
      self.SocketIOService.socket.on("client_mobile_start_stream", resp => {
        //todo VUONG impl feature here
        console.log("new person is streaming...");
      });
    self.SocketIOService.socket &&
      self.SocketIOService.socket.on(
        "client_mobile_streaming_updateinfo",
        resp => {
          //todo VUONG impl feature here
          console.log("person is changing bearing...");
        }
      );
    self.SocketIOService.socket &&
      self.SocketIOService.socket.on("client_mobile_stop_stream", resp => {
        //todo VUONG impl feature here
        console.log("stop streaming..");
      });

    self.SocketIOService.socket &&
      self.SocketIOService.socket.on("client_cctv_status_change", resp => {
        console.log("CCTV's status change");
        //todo VUONG impl feature here
        //todo obj will have this format "aaa"
        //{ id: "",
        //  pointName: "",
        //  address: "",
        //  lat: 0,
        //  lon: 0,
        //  isAvailable: false }
      });
  }

  //CCTV search funcs
  closeCctvSearch() {
    //switch map to search view mode
    this._mapViewMode = this.VIEWMODE.NORMAL;
    //clear all map data
    this.clearAllMapData();
    //load list camera on map
    this.loadCameraList();
  }

  changCctvSearchConfig(config) {
    //set auto update result when moving the map
    if (config.locationReload) {
      this._cctvSearchConfig.opt = {
        ...this._cctvSearchConfig.opt,
        includeLocation: true
      };
    } else if (!config.locationReload) {
      this._cctvSearchConfig.opt = {
        ...this._cctvSearchConfig.opt,
        includeLocation: false
      };
    }

    //reset skip property of cctv config for pagination
    this._cctvSearchConfig.skip = 0;

    //load list camera on map
    this.loadCameraList();
  }

  searchCctv(payload) {
    //switch map to search view mode
    this._mapViewMode = this.VIEWMODE.SEARCH;

    //Save cctv search config
    this._cctvSearchConfig = { ...this._cctvSearchConfig, ...payload };

    //clear all map data
    this.clearAllMapData();

    //load list camera on map
    this.loadCameraList();
  }

  focusCctvPoint(point) {
    let thisPoint = _.find(L.NETWORK.CAMERAES, item => {
      return item.data.points.pointid === point.points.pointid;
    });

    //focus event
    if (thisPoint) {
      thisPoint.setFocusEffect();
      this._map.panTo(
        thisPoint.data &&
          thisPoint.data.points &&
          thisPoint.data.points.location
      );
    }
  }

  initSampleDrone(map, item) {
    let drone = L.drone(map, item, {
      color: "#ED7D31",
      textColor: "#fff",
      text: 0,
      droneId: item.id,
      on: {
        viewdronecamera: layer => {
          //view camera
        }
      }
    });
  }

  /**
   * Setup leaflet search control for map
   * - Declare new leaflet search control
   * - Add control to map
   * @returns {{}}
   */
  initSearchControl() {
    let self = this;
    let geocoder = new google.maps.Geocoder();

    /**
     * Declare leaflet search control
     * See: app/vendors/leaflet/Leaflet.Search.Control.js
     */
    let searchControl = new L.Control.Search({
      sourceData: (text, callResponse) => {
        geocoder.geocode({ address: text }, callResponse);
      },
      markerLocation: true,
      autoType: false,
      autoCollapse: true,
      minLength: 2,
      zoom: 15
    });

    // Set search control to map
    self._map.addControl(searchControl);
  }
  initManageCameraControl() {
    let self = this;
    let geocoder = new google.maps.Geocoder();

    let manageCameraControl = new L.Control.ManageCamera({
      sourceData: (text, callResponse) => {
        geocoder.geocode({ address: text }, callResponse);
      },
      markerLocation: true,
      autoType: false,
      autoCollapse: true,
      minLength: 2,
      zoom: 15
    });

    // Set search control to map
    self._map.addControl(manageCameraControl);
  }

  /**
   * Setup legend control
   * - Declare leaflet legend control
   * - Add control to map
   */
  initLegendControl() {
    let self = this;

    /**
     * Declare leaflet legend control
     * See: app/vendors/leaflet/Leaflet.Legend.Control.js
     */
    let controlLegend = new L.Control.Legend({
      sourceData: []
    });

    // Add control to map
    self._map.addControl(controlLegend);
  }

  /**
   * Setup loading control
   * - Declare leaflet legend control
   * - Add control to map
   */
  initLoadingControl() {
    let self = this;

    /**
     * Declare leaflet legend control
     * See: app/vendors/leaflet/Leaflet.Legend.Control.js
     */
    let controlLegend = new L.Control.Loading({
      position: "bottomright"
    });

    // Add control to map
    self._map.addControl(controlLegend);
    self.loadingControl = controlLegend;
  }

  /**
   * Setup zoom control for map
   * - Declare leaflet zoom control
   * - Add control to map
   */
  initZoomControl() {
    let self = this;

    /**
     * Declare leaflet zoom control
     * See: http://leafletjs.com/reference.html#control-zoom
     */
    let controlZoom = L.control.zoom({
      position: "topright"
    });

    // Add control to map
    self._map.addControl(controlZoom);
  }

  /**
   * Setup toolbar for map
   * - Declare leaflet toolbar control
   * - Add control to map
   */
  initDrawControl() {
    let self = this;

    // REQUIRED for leaflet drawing
    self._drawnItems = L.featureGroup().addTo(self._map);

    /**
     * Declare leaflet toolbar control.
     * See: app/vendors/leaflet/Leaflet.MapToolbar.js
     */
    let mapControl = new L.Control.MapControl(
      _.extend(
        {
          position: "topright"
        },
        L.NETWORK.CONSTANT
      )
    );

    // Add control to map
    self._map.addControl(mapControl);
    self._drawControls = mapControl;
  }

  /**
   * Initialize the Map Control and add the controls to Map
   */
  initControls() {
    let self = this;

    if (self._enableSearchAddress) {
      !self.search && self.initSearchControl();
    } else {
      !self.manageCamera && self.initManageCameraControl();
    }

    !self.legend && self.initLegendControl();

    !self.zoom && self.initZoomControl();

    if (self._isAllowLoadingData()) {
      !self.draw && self.initDrawControl();
    }

    !self.loading && self.initLoadingControl();
  }

  /**
   * get bigger map bound
   * @return [L.LatLngBound] Rectangle bigger map bound 50%
   */
  getBiggerBound(map) {
    return map.getBounds().pad(0.5);
  }

  /**
   * get current distance
   * @return [Number] Distance of center map to point of rectangle
   */
  getDistance(center, bound) {
    var northEast = bound.getNorthEast();
    return center.distanceTo(northEast);
  }

  /**
   * Get map distance
   * @param map
   */
  getMapDistance(map) {
    let self = this;
    let center = map.getCenter();
    let currentBound = self.getBiggerBound(map);
    return Math.ceil(self.getDistance(center, currentBound));
  }

  showLoading() {
    let self = this;
    if (self.loadingControl && self.loadingControl._container) {
      self.loadingControl._container.classList.remove("no-display");
    }
  }

  hideLoading() {
    let self = this;
    if (self.loadingControl && self.loadingControl._container) {
      self.loadingControl._container.classList.add("no-display");
    }
  }

  /**
   * Load camera list from API. Then draw them to map
   */
  loadCameraList() {
    let self = this;

    let renderCamera = data => {
      // Get cam items is valid viewport of map
      let responseCam = _.filter(data, dt => {
        return dt.points.type === L.NETWORK.CAMTYPE.CAM;
      });

      let responseClusters = _.filter(data, dt => {
        return dt.points.type === L.NETWORK.CAMTYPE.CLUSTER;
      });

      // Remove cached cam and cells that not exist in current query (Out of current viewport)
      _.remove(L.NETWORK.CAMERAES, exist => {
        // Check if the cached cam is exists in the current query response
        let isExist = !!_.find(responseCam, d => {
          // Find in response data if cached cam is exists
          return (
            exist.data.points[L.NETWORK.DATAFIELDS.POINT_ID] ===
            d.points[L.NETWORK.DATAFIELDS.POINT_ID]
          );
        });

        // Then
        if (!isExist) {
          exist.removeCamera();
        }

        return !isExist;
      });

      // Remove rendered cam in the current query
      // If api return cam that already rendered in the map, then remove it from the list to prevent re-render
      _.remove(responseCam, d => {
        return _.find(L.NETWORK.CAMERAES, exist => {
          return (
            exist.data.points[L.NETWORK.DATAFIELDS.POINT_ID] ===
            d.points[L.NETWORK.DATAFIELDS.POINT_ID]
          );
        });
      });

      /**
       * Render Camera list to Map
       * See: app/vendors/leaflet/Leaflet.Camera.js
       */
      _.forEach(responseCam, item => {
        // Render camera
        let camera = new L.camera(self._map, item, {
          on: {
            cell: {
              "hide-bts": () => {
                self.hideAllCameraInCurrentArea();
              }
            },

            viewcamera: cameraMarker => {
              let latLng = cameraMarker._latlng;
              let typeView = "point"; //'point', 'person', 'drone'
              self._goldenLayoutService.newViewCameraTab(
                self._container,
                self._map,
                latLng,
                cameraMarker,
                typeView
              );
            }
          },
          bandColors: self.bandColors || L.NETWORK.BANDCOLORS
        });
        L.NETWORK.CAMERAES.push(camera);
      });

      /**
       * Render Cluster list to Map
       * See: app/vendors/leaflet/Leaflet.Cluster.js
       */
      _.forEach(responseClusters, item => {
        item.points.count = item.points.countPoint;
        let cluster = new L.cluster(self._map, item.points);
        L.NETWORK.CLUSTERS.CAMERAES.push(cluster);
      });
    };

    // Get center of map
    self._center = self._map.getCenter();

    // self.initSampleDrone(self._map,
    //   {
    //     lat:self._center.lat,
    //     lon:self._center.lng
    //   }
    // );

    // If provided data -> No need to make a request
    if (self.cameraList) {
      renderCamera(angular.copy(self.cameraList));
      return self._$q.resolve();
    }
    if (!self._isAllowLoadingData()) {
      alert("_isAllowLoadingData");
      return self._$q.resolve();
    }

    // Set search params
    let camParams = self.getMapBoundingInfo();
    if (camParams.BoundTopRightLat === camParams.BoundBottomLeftLat) {
      return self._$q.resolve();
    }
    // Load data
    if (self._mapViewMode === self.VIEWMODE.NORMAL)
      return self._pointService
        .searchPointInAreaByOperatorId(
          self._$rootScope.userOperator &&
            self._$rootScope.userOperator.operatorId,
          camParams
        )
        .success(resp => {
          self.clearClusterMarkers("CAMERAES");
          //var data = resp.data;
          var data = resp;
          !self._isMapOutViewRange() && renderCamera(data);
        });
    else if (self._mapViewMode === self.VIEWMODE.SEARCH) {
      let cctvConfig = self._cctvSearchConfig || {};
      if (cctvConfig.opt && cctvConfig.opt.includeLocation) {
        cctvConfig.opt = { ...cctvConfig.opt, ...camParams };
      }
      return self._pointService
        .searchPointLocationWithInfo(
          cctvConfig.keyword,
          cctvConfig.take,
          cctvConfig.skip,
          cctvConfig.opt
        )
        .then(res => {
          self._$rootScope.$broadcast("searchCctvEvent", {
            task: "searchResult",
            payload: {
              ...res,
              currentIndex:
                self._cctvSearchConfig.skip +
                  ((res.data && res.data.length) || 0)
            }
          });
          self.clearClusterMarkers("CAMERAES");
          //var data = resp.data;
          var data = res.data;
          !self._isMapOutViewRange() && renderCamera(data);
        });
    }
  }

  getMapBoundingInfo() {
    let self = this;
    // Set search params
    let bound = self._map.getBounds();
    return {
      BoundTopRightLat: bound._northEast.lat,
      BoundTopRightLon: bound._northEast.lng,
      BoundBottomLeftLat: bound._southWest.lat,
      BoundBottomLeftLon: bound._southWest.lng,
      ZoomLevel: self._map.getZoom()
    };
  }

  /**
   * Load resource and configuration data
   * This function will be called when component opened
   *
   * - Clear list of data
   * - Render cam list
   */
  loadData() {
    let self = this;

    L.NETWORK.CELLFILTERS = "ALL";
    L.NETWORK.MARKUPS = [];
    // Get map center
    /*self._center = self._map.getCenter();
     let searchMapOptions = {
     "Latitude": self._center.lat,
     "Longitude": self._center.lng,
     "Distance": self._map._zoom
     };*/
    L.NETWORK.BANDCOLORS = {
      UMTS700: "#BF8F00",
      LTE700: "#825F01",
      GSM900: "#7C6205",
      UMTS900: "#A9D08D",
      LTE900: "#558134",
      UMTS850: "#8397B0",
      LTE850: "#D4DDE6",
      UMTS1800: "#F2F2F2",
      LTE1800: "#D9D9D9",
      UMTS2100: "#dd52c4",
      LTE2100: "#FF649A",
      UMTS2300: "#0071C1",
      LTE2300: "#03AFEF",
      UMTS2600: "#9965FF",
      LTE2600: "#9800FF"
    };

    if (!self._isMapOutViewRange()) {
      self.getAllDataInBound();
    }
  }

  /**
   * Clear markers is invalid viewport of map
   * - Clear cam markers
   */
  clearClusterMarkers(key) {
    let self = this;
    // Clear cluster markers
    _.forEach(L.NETWORK.CLUSTERS[key], clusterMarker => {
      // Remove cluster marker from map
      self._map.removeLayer(clusterMarker);
    });
    L.NETWORK.CLUSTERS[key] = [];
  }

  clearAllMapData() {
    let self = this;
    _.forEach(L.NETWORK.CAMERAES, cam => cam.removeCamera());
    _.forEach(L.NETWORK.MARKUPS, markup =>
      self._drawnItems.removeLayer(markup)
    );
    L.NETWORK.CAMERAES = [];
    L.NETWORK.MARKUPS = [];

    // Clear cluster markers
    _.forEach(["CAMERAES"], self.clearClusterMarkers.bind(self));
  }

  /**
   * Used for map preview - Called when change color or technology display
   */
  redrawMap() {
    let self = this;

    // Remove all markers
    let removedCameraMarkers = _.remove(L.NETWORK.CAMERAES);

    _.forEach(removedCameraMarkers, cameraMarker => {
      /**
       * See: app/vendors/leaflet/Leaflet.Camera.js
       */
      cameraMarker.removeCamera();
    });

    self.loadCameraList();
  }

  /**
   * Save current options of map to local storage
   * Save to key "mapPrevOptions" with JSON stringify
   * - mapPrevOptions = {center: {Latitude, Longitude}, zoom}
   *
   * See: http://leafletjs.com/reference.html#map-get-methods
   */
  saveCurrentOptionsOfMap() {
    let self = this;

    // Get map center
    let center = self._map.getCenter();
    self._lastCenterPosition = center;

    // Get zoom level of map
    let zoom = self._map._zoom;

    // Setup map options
    let mapPrevOptions = {
      center: center,
      zoom: zoom
    };

    // Save map center to storage with JSON.stringify
    self._storage.set("mapPrevOptions", JSON.stringify(mapPrevOptions));
  }

  /**
   * Load previous options and set to default variables of map: _defaultZoom, _defaultLoc
   * This function is called before render map to view
   */
  loadPreviousMapOptions() {
    let self = this;

    // Get prev options from local storage
    let mapPrevOptions = self._storage.get("mapPrevOptions");

    if (!mapPrevOptions) {
      return;
    }

    // Convert options to Json
    mapPrevOptions = angular.fromJson(mapPrevOptions);

    // Apply prev options to map
    self._defaultZoom = mapPrevOptions.zoom;
    self._defaultLoc = mapPrevOptions.center;
  }

  /**
   * If user click outside the cam and the cell of the cam, then revert all cam around back to normal
   * Check L.NETWORK.ACTIVECAMERA if is not null: Revert cam markers to default
   */
  revertAllCamMarkers() {
    /**
     * Check flag of cam marker is enable or not?
     * See: setFocus() --> app/vendors/leaflet/Leaflet.Camera.js
     */
    if (!L.NETWORK.ACTIVECAMERA) {
      return;
    }

    // Revert default data
    _.forEach(L.NETWORK.CAMERAES, camMarker => {
      camMarker.revertDefault();
    });

    L.NETWORK.ACTIVECAMERA = null; // disable focus flag of cam marker
  }

  _isAllowLoadingData() {
    let self = this;
    // TODO: recheck correct condition
    return true;
  }

  checkLibraryData() {
    let self = this;
    self.loadData();
  }

  /**
   * Pan map to first camera on already list (used for case when data is provided
   * @private
   */
  _panMapToFirstCamera() {
    let self = this;
    let firstcamera = self.cameraList[0].bts;
    if (firstcamera) {
      self._map.panTo(firstcamera.location);
    }
  }

  hideAllCameraInCurrentArea() {
    let self = this;
    _.forEach(L.NETWORK.CAMERAES, cam => cam.setBlur());
    L.NETWORK.ACTIVECAMERA = [];
  }

  hideAllFOV() {
    let self = this;
    self._hiddenFOVStatus = true;
    _.forEach(L.NETWORK.CAMERAES, cam => cam.hiddenFOV());
  }

  showAllFOV() {
    let self = this;
    self._hiddenFOVStatus = false;
    _.forEach(L.NETWORK.CAMERAES, cam => cam.showFOV());
  }

  _isMapOutViewRange() {
    let self = this;
    return self._map.getZoom() < self._minZoom;
  }

  /**
   * Setup map and display to view
   * - Render map to view
   * - Render map controls
   * - Load data and render marker to map
   * - Setup events: created, moveend
   */
  initMap() {
    let self = this;

    //Set map view mode
    self._mapViewMode = self.VIEWMODE.NORMAL;

    // Load and set prev options of map
    self.loadPreviousMapOptions();

    let mapConfig = {
      center: self._defaultLoc,
      zoom: self._defaultZoom,
      maxZoom: self._maxZoom,
      // minZoom: self._minZoom,
      zoomControl: false
    };

    //only display context menu if user have data on map
    if (!self.contextMenu && self._isAllowLoadingData()) {
      mapConfig = _.extend(mapConfig, {
        /* CONTEXT MENU HOOKS ACTIVATE */
        contextmenu: true,
        contextmenuWidth: 180,
        contextmenuItems: [
          {
            text: "Hide All Cam In This Area",
            index: 5,
            callback: e => {
              // Hide All Camera
              self.hideAllCameraInCurrentArea();
            }
          },
          {
            text: "Show/hide field of view all",
            index: 5,
            callback: e => {
              // Hide All Camera
              self._hiddenFOVStatus ? self.showAllFOV() : self.hideAllFOV();
            }
          }
        ]
      });
    }
    // Render map to view #network_map
    self._map = L.map(self.mapId, mapConfig);

    // Render title layer to map
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(
      self._map
    );

    if (self.cameraList) {
      L.NETWORK.CELLFILTERS = "ALL";
      self._panMapToFirstCamera();
    }

    self.initControls(); // Render map controls

    self.checkLibraryData(); //check if the data of current library is ready, then call ajax to get data, otherwise, show modal.
    // self.loadData();    // Reload data from server. Then render markers to map

    /**
     * Map event: created
     * - Add new layer to "_drawnItems"
     */
    self._map.on("draw:created", e => {
      // Fired when ruler or text is added
      if (e.layer) {
        self._drawnItems.addLayer(e.layer);
      }
    });

    /**
     * Map event: moveend
     * - Clear all markers via viewport
     * - Reload cam list
     */
    self._map.on("moveend", e => {
      //get data in first load, although don't have last position
      if (self._isMapOutViewRange()) {
        // Clear all map data
        self.clearAllMapData();
        // Disable context menu
        self._map.contextmenu.disable();
        // Disable filter button
        self._cellFilterControl && self._cellFilterControl.disable();
        // Disable draw button
        self._drawControls.disableToolbar();
        return;
      }
      self._map.contextmenu.enable();
      self._cellFilterControl && self._cellFilterControl.enable();
      self._drawControls && self._drawControls.enableToolbar();
      if (
        !self._lastCenterPosition ||
        self._map.getCenter().distanceTo(self._lastCenterPosition) > 2
      ) {
        self.getAllDataInBound();
        self.saveCurrentOptionsOfMap(); // save map options to local storage
      }
    });

    /**
     * Map event: click
     * - Detect click on cam marerk
     */
    self._map.on("click", e => {
      self.revertAllCamMarkers(); // Revert cam markers to default if have focused to any one
    });

    self._map.on("mousedown", e => {
      if (e.originalEvent.which === 3) {
        // Right click on cell -> Select this cell
        L.NETWORK.SELECTEDCELL = null;
      }
    });

    self.saveCurrentOptionsOfMap(); // save map options to local storage for first time
  }

  _renderRuler(markup) {
    let self = this;
    var start = L.latLng(markup.locations[0].lat, markup.locations[0].lon);
    var end = L.latLng(markup.locations[1].lat, markup.locations[1].lon);
    var ruler = new L.Ruler(start, end);
    ruler.markupId = markup.id;
    ruler.id = markup.id;
    self._drawnItems.addLayer(ruler);
    L.NETWORK.MARKUPS.push(ruler);
  }

  _renderText(markup) {
    let self = this;
    markup.content = angular.fromJson(markup.content);
    var textEditor = new L.Text(
      L.latLngBounds(
        L.latLng(markup.locations[0].lat, markup.locations[0].lon),
        L.latLng(markup.locations[1].lat, markup.locations[1].lon)
      ),
      {
        content: _.get(markup, "content.content"),
        style: _.get(markup, "content.style")
      }
    );
    textEditor.markupId = markup.id;
    textEditor.id = markup.id;
    self._drawnItems.addLayer(textEditor);
    L.NETWORK.MARKUPS.push(textEditor);
  }

  _renderPolygon(markup) {
    let self = this;
    let drawPolygon = new L.DrawPolygon(
      markup.locations,
      angular.fromJson(markup.content)
    );
    drawPolygon.id = markup.id;
    self._drawnItems.addLayer(drawPolygon);
    L.NETWORK.MARKUPS.push(drawPolygon);
  }

  loadMarkupData() {
    let self = this;

    let renderMarkups = data => {
      // Remove cached markups that not exist in current query (Out of current viewport)
      _.remove(L.NETWORK.MARKUPS, existingMarkup => {
        // Check if the cached markup is exists in the current query response
        let isExist = !!_.find(data, d => {
          return existingMarkup.markupId === d.id || existingMarkup.id === d.id;
        });

        // Then
        if (!isExist) {
          // Remove from map
          self._map.removeLayer(existingMarkup);
        }

        return !isExist;
      });

      _.remove(data, markup => {
        return _.find(L.NETWORK.MARKUPS, exist => {
          return exist.markupId === markup.id || exist.id === markup.id;
        });
      });
      _.each(data, markup => {
        switch (markup.type) {
          case L.NETWORK.MARKUPTYPES.RULER:
            self._renderRuler(markup);
            break;
          case L.NETWORK.MARKUPTYPES.TEXT:
            self._renderText(markup);
            break;
          case L.NETWORK.MARKUPTYPES.POLYGON:
            self._renderPolygon(markup);
            break;
        }
      });
    };

    let markupParams = self.getMapBoundingInfo();
    if (markupParams.BoundTopRightLat === markupParams.BoundBottomLeftLat) {
      return self._$q.resolve();
    }

    return self._markupService.getAllMarkups(markupParams).then(resp => {
      !self._isMapOutViewRange() && renderMarkups(_.get(resp, "data", []));
    });
  }

  getAllDataInBound() {
    let self = this;
    let loadCameraPromises = self.loadCameraList(); // re-render camera markers and cell markers

    if (self.cameraList) {
      return;
    }
    if (!self._isAllowLoadingData()) {
      return self._$q.resolve();
    }
    self.showLoading();
    loadCameraPromises.then(() => {
      let promises;
      promises = [self.loadMarkupData()];
      self._$q.all(promises).then(
        resps => {
          self.hideLoading();
        },
        () => self.hideLoading()
      );
    });
  }

  $onInit() {
    let self = this;

    self._overlayLoader = self._overlayLoaderService.init("networkMap");

    // Set default id for map
    self.mapId = self.mapId || "networkMap";

    // Do init map
    self._$timeout(() => self.initMap());
  }

  $doCheck() {
    let self = this;
    if (self._oldBandColors) {
      if (!angular.equals(self._oldBandColors, self.bandColors)) {
        self._oldBandColors = angular.copy(self.bandColors);
        self._redrawMapBouncing();
      }
    } else {
      self._oldBandColors = angular.copy(self.bandColors);
      // Redraw map when band color is provided (first)
      if (self.bandColors) {
        self._redrawMapBouncing();
      }
    }
    if (self._oldDisplayingTechnology) {
      if (
        !angular.equals(
          self._oldDisplayingTechnology,
          self.displayingTechnology
        )
      ) {
        self._oldDisplayingTechnology = angular.copy(self.displayingTechnology);
        self._redrawMapBouncing();
      }
    } else {
      self._oldDisplayingTechnology = angular.copy(self.displayingTechnology);

      // Redraw map when band technology is provided (first)
      if (self.displayingTechnology) {
        self._redrawMapBouncing();
      }
    }
  }

  $onDestroy() {
    let self = this;
    self._map.off();
    self._map.remove();
    self._overlayLoaderService.destroy("networkMap");
    self.goldenLayoutSizeChanged();
  }
}

export default Controller;
