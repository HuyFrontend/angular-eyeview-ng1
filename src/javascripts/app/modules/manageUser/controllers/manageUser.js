import angular from 'angular';
import * as _ from 'lodash';
let controller = function ($rootScope,
                           confirmationFactory,
                           $filter,
                           toaster,
                           UserService,
                           ResourceService) {
  'ngInject';
  var vm = this;

  function resetModel() {
    vm.user.email = '';
    vm.user.role = '';
    vm.user.lastName = '';
    vm.user.firstName = '';
  }

  function _doAddUser() {
    var model = {
      "emailAddress": vm.user.email,
      "firstName": vm.user.firstName,
      "lastName": vm.user.lastName,
      "roleSystemName": vm.user.role || vm.userRoles.USER.name
    };

    UserService.inviteUser(model).success(function (resp) {
      getUserInvited();
      resetModel();
    }).finally(function () {
      vm.frm.$setPristine();
    });
  }

  /**
   * Add user button
   */
  function addUser() {
    if (vm.paging.usersList.total + vm.paging.pendingUsersList.total >= 5) {
      confirmationFactory.showStaticConfirmBox('Adding a new user from 6th will costs an extra $20/month')
        .then((result)=> {
          if (result) {
            _doAddUser();
          } else {
            vm.frm.$setPristine();
          }
        });
    } else {
      _doAddUser();
    }
  }


  function getUserInvited() {
    let params = {
      operatorId: $rootScope.userOperator && $rootScope.userOperator.operatorId,
      skip: (vm.paging.usersList.pageIndex - 1) * vm.paging.usersList.pageSize,
      take: vm.paging.usersList.pageSize
    }
    UserService.getListUsers(params).then((resp) => {
      vm.invitedUsers = _.map(resp.data.users, (user)=> {
        return _.extend(user, {
          isOwner: user.roleName === 'SuperAdministrator',
          oldRoleName: user.roleName
        });
      });
      vm.paging.usersList.total = resp.data.total;
    });
  }


  function removeUser(user) {
    UserService.removeUser(user.id).success(function () {
      getUserInvited();
      toaster.pop("success", "Success", "Successfully removed user");
    });
  }


  function showConfirm(user, isRemoveInvitation) {
    var message = "Are you sure you want to remove this user ?";
    confirmationFactory.showConfirmBox(message)
      .then(function (value) {
        if (value) {
          !isRemoveInvitation && removeUser(user);
          isRemoveInvitation && removeInvitation(user);
        }
      });
  }

  function changeRole(user) {
    var model = {
      roleSystemName: user.roleName
    };

    let promise =  UserService.changeRole(user.id, model);
    promise.success(function (resp) {
      user.oldRoleName = user.roleName;
    }).error(()=> {
      user.roleName = user.oldRoleName;
    });
  }


  vm.userRoles = ResourceService.getUserRoles();
  delete vm.userRoles.INSIGHTUS_ADMINISTRATOR; //don't use OPERATOR_OWNER in this form
  delete vm.userRoles.OPERATOR_OWNER; //don't use OPERATOR_OWNER in this form
  vm.status = {
    1: 'Pending',
    3: 'Accept'
  };
  vm.user = {
    role: ""
  };
  vm.paging = {
    usersList: {
      pageIndex: 1,
      pageSize: 5
    },
    pendingUsersList: {
      pageIndex: 1,
      pageSize: 5
    }
  };
  vm.invitedUsers = [];
  vm.pendingUsers = [];
  vm.addUser = addUser;
  vm.showConfirm = showConfirm;
  vm.changeRole = changeRole;
  vm.getUserInvited = getUserInvited;
  getUserInvited();
};
export default controller;
