angular.module('textAngular.validators')
  .directive('stripeHtml', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, elem, attrs, ctrl) {
        ctrl.$parsers.push((viewValue)=> {
          return viewValue.replace(/(<p><br\s*[\/]?><\/p>)*$/g, '').replace(/^(<p><br\s*[\/]?><\/p>)*/g, '');
        });
        ctrl.$validators.customValidatorStripeHTML = function (viewValue) {
          let pureText = viewValue.replace(/&#\d+;/g, ''); // Remove tag or special character
          var source = angular.element('<div/>');
          source.html(pureText);
          return !!source.text().length;
        };
      }
    };
  })