let controller = function (accountFactory,
                           $state,
                           toaster,
                           $stateParams) {
  'ngInject';
  var vm = this;

  function resetPassword(_form) {
    var model = {
      "userId": $stateParams.userId,
      "password": vm.user.password,
      "confirmPassword": vm.user.confirmPassword,
      "code": $stateParams.code
    };

    accountFactory.resetPassword(model)
      .success(function (resp) {
      vm.resetSuccessed = true;
      })
      .error(function(err){
        toaster.pop('error', 'Error', err[0]);
      })
      .finally(function () {
      _form.$setPristine();
    });
  }

  vm.resetSuccessed = false;

  vm.resetPassword = resetPassword;
};
export default controller;
