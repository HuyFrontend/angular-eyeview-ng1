import moment from 'moment';
import 'moment-timezone';
window.moment = moment;
let AppMomentModule = angular.module('app.vendors.moment', []);

export default AppMomentModule;
