import angular from 'angular';
import moment from 'moment';

class Controller {
  /*@ngInject*/
  constructor($element, $window, $timeout) {
    // #1
    this._$element = $element;
    this._$window = $window;
    this._$timeout = $timeout;
    this._timeValue = '00:00';
    this._defaultTimePickerOptions = {
      now: this._timeValue,
      autoclose: true,
      // donetext: 'Done',
      afterHide: () => {
        $timeout(()=> {
          this._timeValue = this._$window.$(this.container).find('.clock-picker input').val();
          this.update();
        });
      }
    };
    this._defaultDatePickerOptions = {};

    // bind default value
    if (this.showTime && this.model && moment(this.model).isValid()) {
      this._timeValue = this.model && `${moment(this.model).hours()}:${moment(this.model).minutes()}`;
    }

    this.timePickerOptions = angular.extend(this.timePickerOptions || {}, this._defaultTimePickerOptions);
    this.datepickerOptions = angular.extend(this.datepickerOptions || {}, this._defaultDatePickerOptions);
    this.initFlag = false;
  }

  $onInit() {
    // #3
    this.container = this._$element[0].children[0];
    this.parent = this._$element;
    this.initFlag = true;
    this.refresh();
  }

  _syncChanges(changesObj, field) {
    if (changesObj.datepickerOptions) {
      this.datepickerOptions[field] = changesObj.datepickerOptions.currentValue[field];
    }
  }

  $onChanges(changesObj) {
    // #2
    if (this.initFlag) {
      // Sync changes
      this._syncChanges(changesObj, 'maxDate');
      this._syncChanges(changesObj, 'minDate');
    }
  }

  $doCheck() {
    // console.log('$doCheck', this.datepickerOptions)
  }

  $onDestroy() {
    if (this.clockPicker) {
      this.clockPicker.remove();
      this.clockPicker = null;
    }
  }

  update() {
    let hours = 0, minutes = 0, seconds = 0;
    if (this.showTime && this._timeValue && this._timeValue.indexOf(':')) {
      hours = parseInt(this._timeValue.split(':')[0]);
      minutes = parseInt(this._timeValue.split(':')[1]);
    }
    let value = null;
    //if user clear date, the model is null, don't new Date in this case
    if (this.model) {
      value = new Date(new Date(this.model).setHours(hours, minutes, seconds));
    }
    if (moment(value).isValid()) {
      this.onChange({value: value});
    } else {
      this.onChange({value: null});
    }
  }

  datePickerChange() {
    this.update();
  }

  refresh() {
    if (this.showTime) {
      this._$timeout(()=>{
        this.clockPicker = this._$window.$(this.container).find('.clock-picker').clockpicker(this.timePickerOptions);
      });
    }
  }
}

export default Controller;
