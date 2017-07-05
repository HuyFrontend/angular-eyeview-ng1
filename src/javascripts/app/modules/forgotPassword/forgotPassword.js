import angular from 'angular';
import controller from './controllers/forgotPassword';
import template from './templates/forgotPassword.html';
let module = angular.module('app.forgotPassword', []);

module.controller('ForgotPasswordController', controller);

module.config(
  ($stateProvider) => {
    'ngInject';
    $stateProvider
      .state('page.forgotPassword', {
        url: '/forgot-password',
        templateUrl: template,
        controller: 'ForgotPasswordController',
        authorization: false,
        controllerAs: 'vm',
        classes: ['login_page2']
      });
  }
);
export default module;
