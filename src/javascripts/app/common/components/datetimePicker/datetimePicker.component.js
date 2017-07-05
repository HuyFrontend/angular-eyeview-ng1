// https://docs.angularjs.org/guide/component

import Controller from './datetimePicker.controller';

let Component = {
  restrict: 'E',
  bindings: {
    datepickerOptions: '<',
    timePickerOptions: '<',
    model: '<',
    onChange: '&',
    showTime: '<',
    required: '<', //need to check this is required field or not
    name: '@' //need form name to show validate message
  },
  template: `<div class="datetime-picker" ng-class="{'no-time': !$ctrl.showTime}">
              <div class="date-picker">
                <input type="text" class="form-control" 
                  placeholder="{{$root.appConstant.datetimeFormats.shortDate.toLowerCase()}}"
                   name="{{$ctrl.name ? $ctrl.name : 'datePicker'}}" autocomplete="off"
                   onkeydown="return false;"
                   ng-init="$ctrl.datePicker.opened = false"
                   uib-datepicker-popup="{{$ctrl.datepickerOptions.formatDate || $root.appConstant.datetimeFormats.shortDate}}"
                   datepicker-options="$ctrl.datepickerOptions"
                   ng-change="$ctrl.datePickerChange()"
                   is-open="$ctrl.datePicker.opened"
                   ng-click="$ctrl.datePicker.opened = true"
                   ng-model="$ctrl.model"
                   ng-required="!!$ctrl.required" />
                 <span class="addon" ng-click="$ctrl.datePicker.opened = true">
                    <span class="fa fa-calendar"></span>
                </span>
              </div>
              <div class="clock-picker input-group" ng-if="$ctrl.showTime">
                <input type="text" class="form-control" value="{{::$ctrl._timeValue}}" onkeydown="return false;" placeholder="hh:mm">
                <span class="input-group-addon">
                    <span class="fa fa-clock-o"></span>
                </span>
              </div>
            </div><div class="clearfix"></div>`,
  controller: Controller
};

export default Component;
