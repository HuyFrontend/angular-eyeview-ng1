import io from 'socket.io-client';

/*@ngInject*/
class SocketIOService {
  constructor($rootScope, userContext, $q, $log, appConstant) {
    let self = this;
    self.$rootScope = $rootScope;
    self.userContext = userContext;
    self.$q = $q;
    self.$log = $log;
    self.appConstant = appConstant;
    self._socket = null;
    self.isConnected = false;
    self.connectPromise = $q.defer();
  }

  connect() {
    let self = this;
    self.$log.debug('Connect SocketIO', self._socket);

    // Create promise if not exist
    if (!self.connectPromise) {
      self.connectPromise = self.$q.defer();
    }

    // If the socket was initialized, do nothing then resolve the promise
    if (self._socket) {
      self.connectPromise.resolve();
      return;
    }

    self.isConnected = false;
    let token = self.userContext.auth().token;
    if (!token) {
      self.$log.debug('Can not get accesstoken');
      return;
    }
    self._socket = io.connect(self.appConstant.socketioUrl + self.appConstant.socketioNamespace, {
      'query': `token=${token}`
    });
    //hand shake after connect to SocketIO
    self._socket.on('client_hand_shake_success', function (data) {
      self.$log.debug('SocketIO: client_hand_shake_success');
      self.isConnected = true;
      self.connectPromise.resolve();
    });

    self._socket.on('connect', function () {
      self.$log.debug('SocketIO: connect');
      // self.isConnected = true;
      // self.connectPromise.resolve();
    });

    self._socket.on('disconnect', function () {
      self.$log.debug('SocketIO: disconnect');
      self.isConnected = false;
      self.connectPromise.reject('disconnect');
    });

    self._socket.on('connect_failed', function (err) {
      self.$log.debug('SocketIO: connect_failed', err);
      self.isConnected = false;
      self.connectPromise.reject('connect_failed');
    });

    self._socket.on('error', function (err) {
      self.$log.debug('SocketIO: error', err);
      self.isConnected = false;
      self.connectPromise.reject('error');
    });

  }

  subscribe() {
    let self = this;
    if (!self.connectPromise) {
      self.connectPromise = self.$q.defer();
    }

    if (self.isConnected) {
      self.connectPromise.resolve();
    }
    // Set timeout for connect listener
    setTimeout(() => {
      if (!self.isConnected) {
        self.connectPromise.resolve('Timed out');
      }
    }, 3000);
    return self.connectPromise.promise;
  }

  disconnect() {
    let self = this;
    if (self._socket) {
      self._socket.disconnect();
    }
    //hand shake after connect to SocketIO
    self._socket.off('client_hand_shake_success');
    self._socket.off('connect');
    self._socket.off('disconnect');
    self._socket.off('connect_failed');
    self._socket.off('error');

    self._socket = null;
  }

  get socket() {
    let self = this;
    return self._socket;
  }
}

let Module = angular.module('app.shared.socket-io', []);

Module.service('SocketIOService', SocketIOService);

export default Module;
