import uiSelectModule from 'ui-select';
import uiSelectService from './uiSelect.service';

let AppUiSelectService = angular.module('app.vendors.uiSelect', [uiSelectModule]);

AppUiSelectService.service('uiSelectService', uiSelectService);

export default AppUiSelectService;
