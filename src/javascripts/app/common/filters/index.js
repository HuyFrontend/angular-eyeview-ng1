import angular from 'angular';

import cacheBuster from './cacheBuster';
import cut from './cut';
import fileName from './fileName';
import fileSize from './fileSize';
import fileTypeExt from './fileTypeExt';
import newLines from './newLines';
import number from './number';
import removeExtension from './removeExtension';
import substring from './substring';
import trusted from './trustedUrl';
let module = angular.module('common.filters', [
  cacheBuster.name,
  cut.name,
  fileName.name,
  fileSize.name,
  fileTypeExt.name,
  newLines.name,
  number.name,
  removeExtension.name,
  substring.name,
  trusted.name
]);
export default module;
