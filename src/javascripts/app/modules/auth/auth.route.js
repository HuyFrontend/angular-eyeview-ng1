/*@ngInject*/
export default ($stateProvider) => {
  $stateProvider
    .$state('auth', {
      url: '/auth',
      abstract: true,
      template: '<auth-master></auth-master>'
    });
};
