import rangy from './rangy-core';
window.rangy = rangy;
import './textAngular-rangy';
import './textAngularSetup';

import textAngular from 'exports-loader?"textAngular"!./textAngular';
import './textAngular.validator';
let AppTextAngularModule = angular.module('app.vendors.textAngular', [
  textAngular
]);

export default AppTextAngularModule;
