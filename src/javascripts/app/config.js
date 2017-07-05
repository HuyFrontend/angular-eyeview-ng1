import angular from "angular";

let module = angular.module('app.config', []);

module.run(($rootScope,
            userContext,
            $location,
            accountFactory,
            $timeout,
            $log,
            $state) => {
  'ngInject';
  // Validate Authorization Page
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

    //
    // if (toState.permission && !accountFactory.checkRole(toState.permission)) {
    //   // user have no permission to access
    //   userContext.clearInfo();
    //   $location.path('/page/signin');
    // }

    if (userContext.authentication().isAuth || toState.authorization === false) {

    } else {
      userContext.clearInfo();
      $timeout(() => $state.go('page.signin'));
      // $location.path('/page/signin');
    }
  });
  // Validate Authorization Page
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams) {
    $log.error(arguments);
  });
});
module.value('signalRServer', 'https://www.eyeview.city');
module.constant('appConstant', {

  domain: 'https://staging.eyeview.city',
  //domain: 'http://178.16.10.225/EyeViewBackEnd',
  apiVersion: 'V1',
  version: '1.0.71', // DO NOT DELETE THIS
  azureBlob: 'https://insightusams.blob.core.windows.net/avatar/{userId}/1',
  googleDriveClientId: '859146111921-2u4b2phe6ballqlaf8i0ttfqhftclvmh.apps.googleusercontent.com',
  googleDriveScope: ['https://www.googleapis.com/auth/drive'],
  boxClientId: 't5sfo0x515refc4tx9e13xy7p9n48v7q',
  boxClientSecret: 'mnIGltu4VmpzAHSYNaPQCNt2ZpEMmG5Z',
  dropBoxClientId: 'qmrfotonkpkkwh8',
  numberRegex: /^\d+$/,
  socketioUrl: 'https://ub.eyeview.city',
  socketioNamespace: '/eyeviewstaging',
  app: {
    client_id: "b681e44b-7612-4c02-8bcd-69e4b874f4e1", //V1
    client_secret: "160b935e-9e8c-45c5-8949-d1c681650a08", //V1
    basicode: "YjY4MWU0NGItNzYxMi00YzAyLThiY2QtNjllNGI4NzRmNGUxOjE2MGI5MzVlLTllOGMtNDVjNS04OTQ5LWQxYzY4MTY1MGEwOA==", //V1
    baseUrl: window.location.protocol + '//' + window.location.host,
    //baseUrl: 'http://178.16.10.225/EyeViewBackEnd',
    scope: 'profile',

  },
  datetimeFormats: {
    shortDate: 'dd/MM/yyyy',
    fullDatetime: 'dd/MM/yyyy HH:mm',
    momentFullDateTime: 'DD/MM/YYYY HH:mm:ss',
    momentShortDate: 'DD/MM/YYYY',
    ISOFormat: "YYYY-MM-DDTHH:mm:ss",
    monthYearFormat: "MMMM yyyy"
  },
  regs: {
    email: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    password: /^\S*$/
  }
});
export default module;
