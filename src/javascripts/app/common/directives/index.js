// import autoFocus from './autoFocus';
// import autoGrow from './autoGrow';
// import download from './download';
// import loadingButton from './loadingButton';
import malihuScrollBar from './malihuScrollBar';
import ngMatch from './ngMatch';
import faFile from './faFile';
// import number from './number';
import numericOnly from './numericOnly';
import pageBodyClass from './pageBodyClass';
import permission from './permission';
// import powerbi from './powerbi';
// import spinner from './spinner';
import stopLoader from './stopLoader';
// import traceChart from './traceChart';
import uiColorPicker from './uiColorPicker';
import uiToggleClass from './uiToggleClass';
import updateTitle from './updateTitle';
import userAvatar from './userAvatar';
import topAlert from './topAlert/topAlert';
import ajaxLoading from './ajaxLoading/ajaxLoading';
// import deleteDialog from './deleteDialog/deleteDialog';
// import dropdownEditable from './dropdownEditable/dropdownEditable';
// import exportMijiUtiDialog from './exportMijiUtiDialog/exportMijiUtiDialog';
// import cKendoGrid from './kendo/cKendoGrid';
// import spreadSheet from './spreadSheet/spreadSheet';
// import uploadBox from './uploadBox/uploadBox';
// import uploadProgress from './uploadProgress/uploadProgress';
import windows from './windows/windows';

let module = angular.module('common.directives', [
  // autoFocus.name,
  // autoGrow.name,
  // download.name,
  // loadingButton.name,
  malihuScrollBar.name,
  ngMatch.name,
  faFile.name,
  // number.name,
  numericOnly.name,
  pageBodyClass.name,
  permission.name,
  // powerbi.name,
  // spinner.name,
  stopLoader.name,
  // traceChart.name,
  uiColorPicker.name,
  uiToggleClass.name,
  updateTitle.name,
  userAvatar.name,
  topAlert.name,
  ajaxLoading.name,
  // deleteDialog.name,
  // dropdownEditable.name,
  // exportMijiUtiDialog.name,
  // cKendoGrid.name,
  // spreadSheet.name,
  // uploadBox.name,
  // uploadProgress.name,
  windows.name,
]);
export default module;
