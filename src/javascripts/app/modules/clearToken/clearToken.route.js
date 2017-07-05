/*@ngInject*/
export default ($stateProvider) => {
  $stateProvider
    .$state('clearToken', {
      url: '/force-clear',
      authorization: false,
      resolve: {
        clearToken: (accountFactory, $cookies, userContext, $log, $state) => {
          'ngInject';
          return accountFactory.logout()
            .then(() => {
              $log.debug('register result InsightusAccessToken', $cookies.get('InsightusAccessToken'));
              $log.debug('register result InsightusRefreshToken', $cookies.get('InsightusRefreshToken'));
              $log.debug('register result InsightusLocalAccessToken', $cookies.get('InsightusLocalAccessToken'));

              let flag = $cookies.get('InsightusLocalAccessToken') && $cookies.get('InsightusRefreshToken');
              if (flag) {
                // Save access token and refresh token
                userContext.setToken($cookies.get('InsightusAccessToken'), $cookies.get('InsightusRefreshToken'), true);

                userContext.setLocalToken($cookies.get('InsightusLocalAccessToken'), true);
                // Clear token in cookies
                $cookies.remove('InsightusAccessToken');
                $cookies.remove('InsightusRefreshToken');
                $cookies.remove('InsightusLocalAccessToken');

                $log.debug('register result update user info');
                accountFactory.updateUserInfo(true).then(
                  function () {
                      $log.debug('register result redirect to map');
                      $state.go('app.home');
                    },
                  function () {});
              } else {
                userContext.clearInfo();
                $state.go('page.signin');
              }
            })
        }
      }
    });
};
