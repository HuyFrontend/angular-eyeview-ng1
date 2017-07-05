/*@ngInject*/
export default ($stateProvider) => {
  $stateProvider
    .$state('auth.authorize', {
      url: '/authorize/:code/:state',
      template: `
        <authorize></authorize>
      `,
      authorization: false,
    });
};
