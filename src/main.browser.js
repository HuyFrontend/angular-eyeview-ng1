
import {default as App} from './javascripts/main';

let getParameterByName = function(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};
let code = getParameterByName('code');
let state = getParameterByName('state');

if(code && state){
  window.location.href= window.location.protocol + '//' + window.location.host + '/#/auth/authorize/'+code+'/'+state;
}
else{
  /* eslint-disable */
// Boostraping
  var $html = angular.element(document.getElementsByTagName('html')[0]);
  angular.element().ready(function () {
    $html.addClass('ng-app');
    angular.bootstrap($html, [App.name]);
  });
  /* eslint-enable */
}

