let controller = function (accountFactory,
                           $state,
                           toaster,
                           $rootScope,
                           $log,
                           $window,
                           appConstant,
                           utilFactory,
                           userContext) {
  'ngInject';
  let vm = this;

  function signin(username, password) {
    accountFactory.login(username, password, true)
      .then(function (resp) {
          vm.frm.$setPristine();
          if ($rootScope.saveState) {
            $state.transitionTo($rootScope.saveState.state.name, $rootScope.saveState.params);
          } else {
            $state.transitionTo('app.home');
          }
        },
        function (err) {
          toaster.pop('error', 'Error', 'Username or password incorrect.');
          vm.frm.$setPristine();
        });
  }

  vm.sigin = signin;


};
export default controller;
