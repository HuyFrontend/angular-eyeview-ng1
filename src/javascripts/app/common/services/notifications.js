import angular from 'angular';
export default angular.module('common.services.notifications', [])
  .factory('notifications', ($rootScope) => {
    'ngInject';
    // private notification messages
    // If you make a new notification you will add it here
    // we should use this service only for notifications
    var _START_REQUEST_ = '_START_REQUEST_',
      _END_REQUEST_ = '_END_REQUEST_',
      _LOGIN_SUCCESS_ = '_LOGIN_SUCCESS_',
      _LOGOUT_SUCCESS_ = '_LOGOUT_SUCCESS_',
      _CLOSE_WINDOW_ = '_CLOSE_WINDOW_',
      _RADIAL_SEARCH_ = '_RADIAL_SEARCH_',
      _END_DOCK_ = '_END_DOCK_',
      _MESSAGE_CREATED = '_MESSAGE_CREATED',
      _IMAGE_AVATAR_CHANGED = '_IMAGE_AVATAR_CHANGED',
      _OPEN_ITEM_ = '_OPEN_ITEM_',
      _MAP_PREVIEW_ = '_MAP_PREVIEW_',
      _LIBRARY_CHANGED_ = '_LIBRARY_CHANGED_',
      _MESSAGE_FOCUS_ = '_MESSAGE_FOCUS_',
      _JOB_CHANGED_ = '_JOB_CHANGED_',


      requestStarted = function () {
        $rootScope.$broadcast(_START_REQUEST_);
      },
      requestEnded = function () {
        $rootScope.$broadcast(_END_REQUEST_);
      },
      loginSuccess = function (args) {
        $rootScope.$broadcast(_LOGIN_SUCCESS_, args);
      },
      logoutSuccess = function (args) {
        $rootScope.$broadcast(_LOGOUT_SUCCESS_, args);
      },
      onRequestStarted = function ($scope, handler) {
        $scope.$on(_START_REQUEST_, function (event) {
          handler();
        });
      },
      onLoginSuccess = function ($scope, handler) {
        $scope.$on(_LOGIN_SUCCESS_, function (event, args) {
          handler(args);
        });
      },
      onLogoutSuccess = function (handler) {
        $rootScope.$on(_LOGOUT_SUCCESS_, function (event, args) {
          handler(args);
        });
      },
      onRequestEnded = function ($scope, handler) {
        $scope.$on(_END_REQUEST_, function (event) {
          handler();
        });
      },

      closeWindow = function (args) {
        $rootScope.$broadcast(_CLOSE_WINDOW_, args);
      },
      onCloseWindow = function ($scope, handler) {
        $scope.$on(_CLOSE_WINDOW_, function (event) {
          handler();
        });
      },
      radialSearch = function (args) {
        $rootScope.$broadcast(_RADIAL_SEARCH_, args);
      },
      onRadialSearch = function ($scope, handler) {
        $scope.$on(_RADIAL_SEARCH_, function (event, args) {
          handler(args);
        });
      },
      endDockWindow = function (args) {
        $rootScope.$broadcast(_END_DOCK_, args);
      },
      onEndDockWindow = function ($scope, handler) {
        $scope.$on(_END_DOCK_, function (event) {
          handler();
        });
      },
      messageCreated = function (args) {
        $rootScope.$broadcast(_MESSAGE_CREATED, args);
      },
      onMessageCreated = function ($scope, handler) {
        $scope.$on(_MESSAGE_CREATED, function (event, args) {
          handler(args);
        });
      },
      imageAvatarChanged = function () {
        $rootScope.$broadcast(_IMAGE_AVATAR_CHANGED);
      },
      onImageAvatarChanged = function ($scope, handler) {
        $scope.$on(_IMAGE_AVATAR_CHANGED, function (event, args) {
          handler(args);
        });
      },
      openItem = function (args) {
        $rootScope.$broadcast(_OPEN_ITEM_, args);
      },
      onOpenItem = function ($scope, handler) {
        $scope.$on(_OPEN_ITEM_, function (event, args) {
          handler(args);
        });
      },
      mapPreview = function (args) {
        $rootScope.$broadcast(_MAP_PREVIEW_, args);
      },
      onMapPreview = function ($scope, handler) {
        $scope.$on(_MAP_PREVIEW_, function (event, args) {
          handler(args);
        });
      };

    return {
      requestStarted: requestStarted,
      requestEnded: requestEnded,
      loginSuccess: loginSuccess,
      onRequestStarted: onRequestStarted,
      onRequestEnded: onRequestEnded,
      onLoginSuccess: onLoginSuccess,
      logoutSuccess: logoutSuccess,
      onLogoutSuccess: onLogoutSuccess,
      closeWindow: closeWindow,
      onCloseWindow: onCloseWindow,
      radialSearch: radialSearch,
      onRadialSearch: onRadialSearch,
      endDockWindow: endDockWindow,
      onEndDockWindow: onEndDockWindow,
      messageCreated: messageCreated,
      onMessageCreated: onMessageCreated,
      imageAvatarChanged: imageAvatarChanged,
      onImageAvatarChanged: onImageAvatarChanged,
      openItem: openItem,
      onOpenItem: onOpenItem,
      mapPreview: mapPreview,
      onMapPreview: onMapPreview

    };
  });

