import routes from './authorize.route';
import Component from './authorize.component';

let AppAuthorizePage =
  angular.module('app.authorize', [])
    .config(routes)
    .component('authorize', Component);

export default AppAuthorizePage;
