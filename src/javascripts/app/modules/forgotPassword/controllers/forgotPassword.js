let controller =
  function (accountFactory,toaster) {
    'ngInject';
    var vm = this;

    function forgotPassword(_form) {
      accountFactory.forgotPassword(vm.email)
        .success(function (resp) {
          vm.forgetPasswordSuccess = true;
        })
        .error(function(err){
          toaster.pop('error', 'Error', 'Your email is not exist in our system.');
        })
        .finally(function () {
          _form.$setPristine();
        });
    }

    vm.forgotPassword = forgotPassword;
  };
export default controller;
