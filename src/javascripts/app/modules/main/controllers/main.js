let controller = function ($scope,
                           accountFactory,
                           userContext,
                           $window,
                           $state,
                           topAlertFactory,
                           $rootScope,
                           $timeout,
                           notifications,
                           $uibModalStack) {
  'ngInject';
  var vm = this;


  // The TopAlert directive not rendered yet, need wait a little bit
  $scope.$on('$topAlert.loaded', () => {


  });
  $scope.$on('$destroy', function () {
    // Off event document keydown (attached to add event Esc to close for window)
    $(document).off('keydown');
    $uibModalStack.dismissAll();
  });


};
export default controller;
