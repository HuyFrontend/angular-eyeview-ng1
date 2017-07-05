import angular from "angular";
import common from "./common";
import config from "./config";
import startup from "./startup";
import provider from "./provider";
import modules from "./modules/main";

import SocketIoServiceModule from './shared/socketio.service';
// Global modules
let AppVendors = require('../../main.vendor');

let App =
  angular.module('app.mainApp', AppVendors.modules.concat([
    common.name,
    config.name,
    SocketIoServiceModule.name,
    startup.name,
    provider.name,
    modules.name
  ]));
// App.run(($cookies, userContext, accountFactory, SignalRHubProxy, $log, $state) => {
//   'ngInject';
//
//   $log.debug('register result InsightusAccessToken', $cookies.get('InsightusAccessToken'));
//   $log.debug('register result InsightusRefreshToken', $cookies.get('InsightusRefreshToken'));
//   $log.debug('register result InsightusLocalAccessToken', $cookies.get('InsightusLocalAccessToken'));
//
//   let flag = $cookies.get('InsightusLocalAccessToken') && $cookies.get('InsightusRefreshToken');
//   if (flag) {
//     // Save access token and refresh token
//     userContext.setToken($cookies.get('InsightusAccessToken'), $cookies.get('InsightusRefreshToken'), true);
//
//     userContext.setLocalToken($cookies.get('InsightusLocalAccessToken'), true);
//     // Clear token in cookies
//     $cookies.remove('InsightusAccessToken');
//     $cookies.remove('InsightusRefreshToken');
//     $cookies.remove('InsightusLocalAccessToken');
//
//     $log.debug('register result update user info');

//   }
// })

export default App;
