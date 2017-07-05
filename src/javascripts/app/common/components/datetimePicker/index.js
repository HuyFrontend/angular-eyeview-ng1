import 'clockpicker/dist/jquery-clockpicker';
import Component from './datetimePicker.component';

let AppMainDatetimePickerComponent = angular.module('app.common.components.datetimePicker', [])
  .component('datetimePicker', Component);

export default AppMainDatetimePickerComponent;
