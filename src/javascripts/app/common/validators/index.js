import dateRange from "./dateRange";
import number from "./number";
import httpUrl from "./httpUrl";
import decimal from "./decimal";
import distinct from "./distinct";

let module = angular.module('common.validators', [
  dateRange.name,
  number.name,
  httpUrl.name,
  decimal.name,
  distinct.name,
]);
export default module;
