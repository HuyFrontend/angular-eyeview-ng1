import jQuery  from 'jquery';
import angular from 'angular';
import * as _ from 'lodash';
let module = angular.module('common.directives.cKendoGrid', []);
module.directive('cKendoGrid', (appConstant,
                                userContext,
                                toaster,
                                $timeout,
                                windowsService) => {
  'ngInject';

  function linkFn(scope, elem, attrs) {

    // Origin data source
    // Add some default here if need
    var dataSource = {
      transport: {},
      batch: true,
      data: []
    };
    // Grid options
    // Add some default here if need
    // It will be overridden if declared
    var options = {
      pageable: {
        pageSizes: [10, 25, 50, 100]
      },
      sortable: true,
      noRecords: true
    };


    // Normalize url function
    if (scope.vm.dataSourceConfig) {
      _.forOwn(scope.vm.dataSourceConfig, function (config, configName) {
        if (config.authorization) {
          config.headers = config.headers || {};
          var authData = userContext.authentication();
          if (authData.isAuth) {
            var token = authData.token;
            config.headers['Authorization'] = 'Bearer ' + token;
          }
        }
      });

      if (scope.vm.dataSourceConfig['data'] && scope.vm.dataSourceConfig['data'].length) {
        dataSource['data'] = scope.vm.dataSourceConfig['data'];
        delete dataSource.transport;
      } else {
        // Get data reader config
        dataSource.transport['read'] = scope.vm.dataSourceConfig['fetchingDataConfig'];
        dataSource.transport['create'] = scope.vm.dataSourceConfig['creatingDataConfig'];
        dataSource.transport['update'] = scope.vm.dataSourceConfig['updatingDataConfig'];
        dataSource.transport['destroy'] = scope.vm.dataSourceConfig['deletingDataConfig'];
        dataSource.transport['parameterMap'] = scope.vm.dataSourceConfig['parameterMap'];
        dataSource['schema'] = scope.vm.dataSourceConfig['schema']; // for error handling
        dataSource['serverPaging'] = scope.vm.dataSourceConfig['serverPaging'] || false; // for error handling
        dataSource['error'] = function (e) {
          var errorMessage;
          if (e.xhr.responseJSON) {
            if (e.xhr.responseJSON.errorMessage) {
              errorMessage = e.xhr.responseJSON.errorMessage;
            }
            if (e.xhr.responseJSON.message) {
              errorMessage = e.xhr.responseJSON.message;
            }
            if (e.xhr.responseJSON.length) {
              errorMessage = _.reduce(e.xhr.responseJSON, function (memo, msg) {
                memo += msg + '<br>';
                return memo;
              }, '')
            }
          }
          if (errorMessage) {
            $timeout(function () {
              toaster.pop({
                type: 'error',
                title: 'Error',
                body: errorMessage,
                bodyOutputType: 'trustedHtml'
              });
            })
          }

        };
      }

      // Page size and schema
      dataSource['pageSize'] = scope.vm.dataSourceConfig['pageSize'];

      var declaredOpts = scope.vm.dataSourceConfig['options'];


      // Fix the popup modal when edit row
      // Fix name, add more button if need here
      declaredOpts.edit = function (e) {
        if (e.model.isNew()) {


          var update = jQuery(e.container).parent().find(".k-grid-update");
          $(update).html('<span class="k-icon k-update"></span>Add');

          e.container.kendoWindow("title", declaredOpts.popupAddHeader || "Add new customer");
          var notAllowCols = _.filter(declaredOpts.columns, function (col) {
            return !col.allowOnAdd;
          });
          _.each(notAllowCols, function (col) {
            var colField = col.field;
            e.container.find('input[name *= "' + colField + '"]').attr('disabled', true);
          });

        } else {
          e.container.kendoWindow("title", declaredOpts.popupEditHeader || "Edit customer");
          var notAllowCols = _.filter(declaredOpts.columns, function (col) {
            return !col.allowOnEdit;
          });
          _.each(notAllowCols, function (col) {
            var colField = col.field;
            e.container.find('input[name *= "' + colField + '"]').attr('disabled', true);
          });
        }
        var validator = e.container.data("kendoValidator");
        var findingInput = e.container.find('input.k-input');

        // Finding first not disabled input to focus in
        var findingNotDisabledInput = e.container.find('input.k-input:not([disabled])');
        e.container.data('kendoWindow').bind('activate', function () {
          findingNotDisabledInput[0].focus();
        });


        // Bind event validator for input
        findingInput.focusout(function (e) {
          validator.validateInput(e.target);
        })
      };


      // Confirm modal selector for display
      var confirmModalSelector = '#' + declaredOpts.modalConfirmId;

      // Button confirm yes/no
      var confirmYesId = '#' + (declaredOpts.confirmModalYesButtonId || 'yes');
      var confirmNoId = '#' + (declaredOpts.confirmModalNoButtonId || 'no');

      // Create instance confirm window
      var confirmWindow = jQuery(confirmModalSelector).kendoWindow({
        title: "Confirm Delete",
        visible: false, //the window will not appear before its .open method is called
        resizable: false,
        width: "400px",
        height: declaredOpts.confirmModalHeight + 'px',
        modal: true,
        template: '<input type="button" value="click me!" id="btnClickMe" />'
      }).data("kendoWindow");


      // For handle custom command
      // If command name is "Delete" -> Create button with confirm Yes/No
      if (declaredOpts.columns) {
        // Get command column
        var columnCommands = _.filter(declaredOpts.columns, function (col) {
          return col.command;
        });
        _.each(columnCommands, function (col) {
          _.each(col.command, function (command, idx) {
            if (command === 'Delete') {
              col.command[idx] = {
                name: "Delete",
                click: function (e) { //add a click event listener on the delete button
                  e.preventDefault();
                  var grid = this;
                  var tr = jQuery(e.target).closest("tr"); //get the row for deletion
                  var data = this.dataItem(tr); //get the row data so it can be referred later
                  if (confirmWindow) {
                    confirmWindow.open().center();
                  }


                  function onClickYes(d) {
                    d.preventDefault();
                    jQuery(document).off('click', confirmYesId, onClickYes);
                    jQuery(document).off('click', confirmNoId, onClickNo);
                    grid.removeRow(tr);
                    confirmWindow.close();
                  }

                  function onClickNo(d) {
                    jQuery(document).off('click', confirmYesId, onClickYes);
                    jQuery(document).off('click', confirmNoId, onClickNo);
                    d.preventDefault();
                    confirmWindow.close();
                  }

                  jQuery(document).on('click', confirmYesId, onClickYes);
                  jQuery(document).on('click', confirmNoId, onClickNo);
                }
              }
            }
          })
        })
      }

      // Extend options
      options = angular.extend(options, declaredOpts);

      // Set datasource
      options['dataSource'] = dataSource;

      options.dataBound = function () {
        if (scope.vm.dataSourceConfig.export) {
          elem
            .parent()
            .find(".k-pager-wrap")
            .append('<span class="export" style="margin-left:2em;float:right;"><a href="javascript:;" class="btn btn-default btn-small">Exports</a></span>')
            .delegate(".export a", "click", function (e) {
              scope.vm.dataSourceConfig.export();
            });
        }
      };
    }

    registerClickSelect(options.selection);
    var grid = elem.kendoGrid(options);


    function registerClickSelect(selectConfig) {
      if (selectConfig && selectConfig.enabled > 0) {
        return $(elem).delegate('tbody>tr', 'mousedown', function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (e.which === selectConfig.enabled) {
            selectConfig.onSelect($(elem).data('kendoGrid').dataItem(this));
          }
        });
      }
    }

    function resizeGrid() {
      var gridElement = elem.parent(),
        dataArea = gridElement.find(".k-grid-content"),
        gridHeight = gridElement.innerHeight() || 0,
        gridHeaderHeight = gridElement.find(".k-grid-header").outerHeight() || 0,
        gridToolbarHeight = gridElement.find(".k-grid-toolbar").outerHeight() || 0,
        paggerHeight = gridElement.find(".k-grid-pager").outerHeight() || 0;


      var height = gridHeight - gridHeaderHeight - paggerHeight - gridToolbarHeight;
      // if(height<150){
      //   height = 150;
      // }
      dataArea.height(height);
      elem.data("kendoGrid") && elem.data("kendoGrid").resize();
    }

    function listenWindowResize() {
      var eventWindow = windowsService.getWindow(scope.vm.windowId);
      if (eventWindow) {
        eventWindow.instance.on(wcDocker.EVENT.RESIZED, function () {
          resizeGrid();
        });
        eventWindow.instance.on(wcDocker.EVENT.CLOSED, function () {
          $(elem).undelegate('tbody>tr');
        });
      }
    }

    function registerWindowResize() {
      $(window).on('resize.window' + '-' + scope.vm.windowId || 'default', resizeGrid);
    }

    function unRegisterWindowResize() {
      $(window).off('resize.window' + '-' + scope.vm.windowId || 'default');
    }

    $timeout(function () {
      resizeGrid();
    }, 100);

    if (scope.vm.windowId) {
      listenWindowResize();
    }
    registerWindowResize();

    scope.$on('$destroy', function () {
      unRegisterWindowResize();
    })
  }


  function controllerFn() {

  }

  return {
    restrict: 'E',
    link: linkFn,
    controller: controllerFn,
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      dataSourceConfig: '=cKGridOptions',
      windowId: '@',
      instance: '=?'
    }
  };
});
export default module;
