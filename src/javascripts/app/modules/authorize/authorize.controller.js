export default class Controller {
  /*@ngInject*/
  constructor(accountFactory, $state, $stateParams, $rootScope, userContext, toaster, $timeout,notifications) {
    this._accountFactory = accountFactory;
    this._$rootScope = $rootScope;
    this._userContext = userContext;
    this._notifications = notifications;
    this._$state = $state;


  }


}
