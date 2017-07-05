import angular from "angular";
import Component from "./components/myNavbar";
import uiSelect from "ui-select";
let module = angular.module('app.navbar', [uiSelect]);

module.component('myNavbar', Component);

export default module;
