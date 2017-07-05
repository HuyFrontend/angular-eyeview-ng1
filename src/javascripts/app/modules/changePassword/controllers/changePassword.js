let controller = function (accountFactory,
                           $state,
                           toaster,
                           $stateParams) {
  'ngInject';
  var vm = this;

  function changePassword(_form) {

    var model = {
      "oldpassword": vm.user.oldpassword,
      "newpassword": vm.user.newpassword,
      "confirmPassword": vm.user.confirmPassword,
    };

    accountFactory.changePassword(model)
      .success(function (resp) {
        vm.changePassword = true;
        toaster.pop('success', 'Success', 'Your password has been changed');
      })
      .error(function(err){
        toaster.pop('error', 'Error', err[0]);
      })
      .finally(function () {
        _form.$setPristine();
      });
  }

  vm.changeSuccessed = false;
  vm.changePassword = changePassword;
};
export default controller;
