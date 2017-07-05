import context from './context';
import services from './services';
import filters from './filters';
import validators from './validators';
import directives from './directives';
import components from './components';

let module = angular.module('common.index', [
  context.name,
  services.name,
  filters.name,
  validators.name,
  directives.name,
  components.name,
]);
export default module;
