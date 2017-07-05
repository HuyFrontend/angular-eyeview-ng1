let ocLazyLoadConfig = require('./../../main.ocLazyLoad');
let module = angular.module('app.startup', []);

module.run((userContext,
            $rootScope,
            appConstant,
            $ocLazyLoad,
            $state,
            notifications,
            SocketIOService) => {
  'ngInject';
  // Load Authentication data from local storage
  userContext.loadFromLocal();

  notifications.onLoginSuccess($rootScope, ()=>{
    SocketIOService.connect();
  });
  notifications.onLogoutSuccess(()=>{
    //SocketIOService.socket.off('client_join_operator_room_success');
    SocketIOService.disconnect();
  });
  window.$$ocLazyLoad = $ocLazyLoad;
  ocLazyLoadConfig();

  // Set AppConstant to $rootScope
  $rootScope.appConstant = appConstant;
  $rootScope.$state = $state;

  SocketIOService.connect();

});

export default module;
