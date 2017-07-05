import angular from 'angular';

import account from './account';
import box from './box';
import common from './common';

import confirmation from './confirmation';
import debounce from './debounce';
import dropbox from './dropbox';
import file from './file';
import googleDrive from './googleDrive';

import notifications from './notifications';
import permission from './permission';
import util from './util';
import goldenLayout from './goldenLayout';
//register service here
import manageCameraGL from './manageCameraGL';

let module = angular.module('common.services', [
  account.name,
  box.name,
  common.name,
  confirmation.name,
  debounce.name,
  dropbox.name,
  file.name,
  googleDrive.name,
  notifications.name,
  permission.name,
  util.name,
  goldenLayout.name,
  manageCameraGL.name
]);

export default module;
