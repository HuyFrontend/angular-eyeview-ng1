import angular from 'angular';
import jQuery from 'jquery';

let module = angular.module('common.directives.cKendoChart', []);
module.directive('cKendoChart', (windowsService) => {
  'ngInject';
  let x0 = null, xBg = null, isSelectingHandler = false;

  function removeEvents() {
    $(this.selectorMngmt.$kLeftHandler)
      .off('mousedown.selector')
      .off('mousemove.selector')
      .off('mouseup.selector');
    $(this.selectorMngmt.$kRightHandler)
      .off('mousedown.selector')
      .off('mousemove.selector')
      .off('mouseup.selector');
    $(this.selectorMngmt.$kMiddleSelection)
      .off('mousedown.selector')
      .off('mousemove.selector')
      .off('mouseup.selector')
      .off('dblclick.selector');
    $(this.selectorMngmt.$kSelector)
      .off('mousedown.ckChart')
      .off('mousemove.selector')
      .off('mouseup.selector')
  }

  /**
   * Mouse down on background (the selection range)
   * @param e
   */
  function mouseDownBackground(e) {
    e.preventDefault();
    e.stopPropagation();
    xBg = e.clientX;
  }

  /**
   * Mouse move on background (the selection range)
   * @param e
   */
  function mouseMoveBackground(e) {
    if (!_.isNull(xBg)) {
      // If user is dragging to move the selection range
      // Resize both left and right mask but not resize the selection range size
      let selectorMngmnt = this.elem.data('selectable');
      let leftMaskBound = selectorMngmnt.$kLeftMask.getBoundingClientRect();
      let rightMaskBound = selectorMngmnt.$kRightMask.getBoundingClientRect();
      let dx = e.clientX - xBg;
      // Try to reach the boundary (left or right bound)
      if (rightMaskBound.width - dx < -1 || leftMaskBound.width + dx < -1) {
        return;
      }
      // Redraw masks based on new data
      drawMasks.call(this, leftMaskBound.width + dx, rightMaskBound.width - dx);
      this.elem.data('selectable', selectorMngmnt);
      // Set the new x to calculate delta x for next running dragging
      xBg = e.clientX;
    }
  }

  /**
   * On mouse up selection region (background)
   */
  function mouseUpBackground(e) {
    // Reset things
    xBg = null;
  }

  /**
   * On Mouse down handler (i.e two small piece)
   * @param type
   * @param e
   */
  function mouseDownHandler(type, e) {
    let selectorMngmnt = this.elem.data('selectable');
    e.preventDefault();
    e.stopPropagation();
    x0 = e.clientX;
    isSelectingHandler = true;
    // Calculate what type of handler (left or right)
    // Type = 0 -> left
    selectorMngmnt.selectedMask = type === 0 && 'LH' || 'RH';
  }

  /**
   * Shortcut to create DOM Element
   * @param elem
   * @param className
   * @param style
   * @returns {Element}
   */
  function createElement(elem, className, style) {
    // Remove drawn items
    this.elem.find(elem + '.' + className.split(' ').join('.')).remove();
    // Create new one
    let el = document.createElement(elem);
    el.className = className;
    $(el).css(style);
    return el;
  }

  /**
   * Render selector container (that includes: left mask, right mask, selection area, left-right handler)
   */
  function renderSelectorContainer() {
    let selectorMngmnt = this.elem.data('selectable');
    // This is a div have width height cover the plot area
    selectorMngmnt.$kSelector = createElement.call(this, 'div', 'k-selector', {
      top: (selectorMngmnt.$plotArea[0].getBoundingClientRect().top - selectorMngmnt.$parentContainerBoudingBox.top) + 'px',
      left: (selectorMngmnt.$plotArea[0].getBoundingClientRect().left - selectorMngmnt.$parentContainerBoudingBox.left) + 15 + 'px',
      height: selectorMngmnt.$plotArea[0].getBoundingClientRect().height + 'px',
      width: selectorMngmnt.$plotArea[0].getBoundingClientRect().width + 'px',
      'z-index': 20,
      'display': 'none'
    });
    // Add it to chart
    selectorMngmnt.$chart.append(selectorMngmnt.$kSelector);
    // Save it to reuse in some places
    this.elem.data('selectable', selectorMngmnt);
  }

  /**
   * Mouse down selector container (or plot area)
   * @param e
   */
  function onMouseDown(e) {
    let selectorMngmt = this.elem.data('selectable') || {};
    e.preventDefault();
    // Set default handler is Right
    selectorMngmt.selectType = "RH";
    // It mean you are pressing on handler
    selectorMngmt.isSelecting = true;
    // Draw mask based on new data
    let d = e.clientX - selectorMngmt.$plotArea[0].getBoundingClientRect().left;
    drawMasks.call(this, d, selectorMngmt.$plotArea[0].getBoundingClientRect().width - d);
    // Start dragging event
    selectorMngmt.isDragging = true;
    selectorMngmt.selectedMask = null;
    this.elem.data('selectable', selectorMngmt);
  }

  /**
   * On Mouse move selector container (or plot area)
   * @param e
   */
  function onMouseMove(e) {
    let selectorMngmt = this.elem.data('selectable') || {};
    // Get left and right mask position
    let leftMaskBound = selectorMngmt.$kLeftMask.getBoundingClientRect();
    let rightMaskBound = selectorMngmt.$kRightMask.getBoundingClientRect();
    let plotArea = selectorMngmt.$plotArea[0].getBoundingClientRect();
    // If user try to drag invert (from right to left)
    // then reverse the selection mask
    if (rightMaskBound.left <= leftMaskBound.right) {
      selectorMngmt.selectedMask = selectorMngmt.selectedMask === 'RH' ? 'LH' : 'RH';
    }
    if (!selectorMngmt.isDragging && !isSelectingHandler) {
      return;
    }

    if (_.isNull(x0)) {
      x0 = e.clientX;
      return;
    }

    if (selectorMngmt.selectedMask === 'RH') {
      // You are dragging to right so should reduce the right mask size
      // Draw new mask with reduce the right mask size
      drawMasks.call(this, leftMaskBound.width, plotArea.width - e.clientX + selectorMngmt.$plotArea[0].getBoundingClientRect().left);
    } else {

      // You are dragging to left and should reduce the left mask size
      drawMasks.call(this, e.clientX - selectorMngmt.$plotArea[0].getBoundingClientRect().left, rightMaskBound.width);
    }

    x0 = e.clientX;

    this.elem.data('selectable', selectorMngmt);
  }

  /**
   * On mouse up plot area
   * @param e
   */
  function onMouseUp() {
    // For reset things
    let selectorMngmt = this.elem.data('selectable') || {};
    selectorMngmt.isDragging = false;
    selectorMngmt.selectedMask = null;
    x0 = null;
    isSelectingHandler = false;
    this.elem.data('selectable', selectorMngmt);
  }

  /**
   * For clearing masks and remove event handler
   * @param selectorMngmt
   */
  function clearMasks(selectorMngmt) {
    let selector = selectorMngmt || this.elem.data('selectable') || {};
    _.each($(selector.$kSelector).children, function (child) {
      $(child).off()
    });
    $(selector.$kSelector).empty();
    $(selector.$kSelector).hide();
  }

  /**
   * Do Draw left-right masks based on data
   * @param leftWidth
   * @param rightWidth
   */
  function drawMasks(leftWidth, rightWidth) {
    let selectorMngmt = this.elem.data('selectable') || {};
    let $this = this;
    // Create left mask with given width and stay at left (left: 0)
    selectorMngmt.$kLeftMask = createElement.call(this, 'div', 'k-mask k-left-mask', {
      width: leftWidth,
      left: 0,
      'z-index': 10 // Should have them for make sure thing overlapping then events will be triggered
    });
    // Create right mask with given width and stay at right (right: 0)
    selectorMngmt.$kRightMask = createElement.call(this, 'div', 'k-mask k-right-mask', {
      width: rightWidth,
      right: 0,
      'z-index': 10
    });
    // Create middle selection that have width = allWidth - sum of masks width
    selectorMngmt.$kMiddleSelection = createElement.call(this, 'div', 'k-middle-selection', {
      width: selectorMngmt.$plotArea[0].getBoundingClientRect().width - (leftWidth + rightWidth),
      left: leftWidth,
      height: '100%',
      position: 'absolute',
      'z-index': 30
    });

    // Create handler
    selectorMngmt.$kLeftHandler = createElement.call(this, 'div', 'k-handle k-leftHandle', {
      top: 48 + '%',
      left: leftWidth - 5 + 'px',
      'z-index': 31
    });
    // Create handler
    selectorMngmt.$kRightHandler = createElement.call(this, 'div', 'k-handle k-rightHandle', {
      top: 48 + '%',
      right: rightWidth - 5 + 'px',
      'z-index': 31
    });
    // Appending things
    $(selectorMngmt.$kSelector).append(selectorMngmt.$kLeftMask);
    $(selectorMngmt.$kSelector).append(selectorMngmt.$kRightMask);
    $(selectorMngmt.$kSelector).append(selectorMngmt.$kMiddleSelection);
    $(selectorMngmt.$kSelector).append(selectorMngmt.$kLeftHandler);
    $(selectorMngmt.$kSelector).append(selectorMngmt.$kRightHandler);
    selectorMngmt.leftMaskWidth = leftWidth;
    selectorMngmt.rightMaskWidth = rightWidth;

    // Attach events
    attachEvent('mousemove.selector', selectorMngmt.$kSelector, onMouseMove.bind(this));
    attachEvent('mouseup.selector', selectorMngmt.$kSelector, onMouseUp.bind(this));
    attachEvent('mousedown.selector', selectorMngmt.$kMiddleSelection, mouseDownBackground.bind(this));
    attachEvent('mousemove.selector', selectorMngmt.$kMiddleSelection, mouseMoveBackground.bind(this));
    attachEvent('mouseup.selector', selectorMngmt.$kMiddleSelection, mouseUpBackground.bind(this));
    attachEvent('dblclick.selector', selectorMngmt.$kMiddleSelection, selectorMngmt.onSelect.bind(this));


    attachEvent('mousedown.selector', selectorMngmt.$kLeftHandler, function (e) {
      mouseDownHandler.call($this, 0, e);
    });
    attachEvent('mousemove.selector', selectorMngmt.$kLeftHandler, onMouseMove.bind(this));
    attachEvent('mouseup.selector', selectorMngmt.$kLeftHandler, onMouseUp.bind(this));


    attachEvent('mousedown.selector', selectorMngmt.$kRightHandler, function (e) {
      mouseDownHandler.call($this, 1, e);
    });
    attachEvent('mousemove.selector', selectorMngmt.$kRightHandler, onMouseMove.bind(this));
    attachEvent('mouseup.selector', selectorMngmt.$kRightHandler, onMouseUp.bind(this));


    this.elem.data('selectable', selectorMngmt);
  }

  /**
   * Attach events to instance
   * @param evt
   * @param instance
   * @param fn
   */
  function attachEvent(evt, instance, fn) {
    instance && $(instance).off(evt).on(evt, fn);
  }

  /**
   * Attach event mouse down chart and start rendering things here
   * @param elem
   */
  function attachEventMouseDown(elem) {
    let selectorMngmt = elem.data('selectable') || {};
    attachEvent('mousedown.ckChart', selectorMngmt.$kSelector, onMouseDown.bind({
      elem: elem
    }))
  }

  /**
   * Clear on click outside plot area
   * @param selectorMngmt
   * @param windowId
   */
  function clearOnClickOutside(selectorMngmt, windowId) {
    $(document)
      .off('click.outside_' + windowId)
      .on('click.outside_' + windowId, function (event) {
        if (!$(event.target).closest(selectorMngmt.$chart).length && !$(event.target).is(selectorMngmt.$chart)) {
          clearMasks.call(this, selectorMngmt);
        }
      });
  }

  function attachEventMouseDownChart(selectorMngmt) {
    attachEvent('mousedown.chart', selectorMngmt.$plotArea, function (e) {
      $(selectorMngmt.$kSelector).show();
      onMouseDown.call(this, e);
    }.bind(this));
  }

  /**
   * Enable chart selection
   * @param chartOptions
   * @param windowId
   * @param onSelect
   */
  function allowSelectChart(chartOptions, windowId, onSelect) {
    let $this = this;
    chartOptions.render = function () {
      let selectorMngmt = $this.elem.data('selectable') || {};
      selectorMngmt.$chart = $this.elem;
      selectorMngmt.$plotArea = $(selectorMngmt.$chart.find('svg > g > path').get(1));
      selectorMngmt.$plotArea.css({
        position: 'relative'
      });
      selectorMngmt.$parentContanier = selectorMngmt.$plotArea.parent()[0];
      selectorMngmt.$parentContainerBoudingBox = selectorMngmt.$parentContanier.getBoundingClientRect();
      selectorMngmt.onSelect = onSelect;
      selectorMngmt.removeEvents = removeEvents.bind({selectorMngmt: selectorMngmt});
      $this.elem.data('selectable', selectorMngmt);
      renderSelectorContainer.call($this);
      attachEventMouseDownChart.call($this, selectorMngmt);
      attachEventMouseDown($this.elem);

      clearOnClickOutside(selectorMngmt, windowId);
    }
  }

  function linkFn(scope, elem) {
    let kendoChartOpts = angular.copy(scope.vm.chartConfig), selectors;

    if (scope.vm.chartConfig.isSelectable) {
      allowSelectChart.call({elem: elem, instance: scope.vm.instance}, kendoChartOpts, scope.vm.windowId,
        function () {
          let selectionMask = this.elem.data('selectable').$kMiddleSelection.getBoundingClientRect();
          let fullWidth = this.elem.data('selectable').$plotArea[0].getBoundingClientRect();
          let leftMask = this.elem.data('selectable').$kLeftMask.getBoundingClientRect();
          let selection = {
            left: leftMask.width,
            right: leftMask.width + selectionMask.width
          };
          let range = scope.vm.instance.data('kendoChart').getAxis().range();
          // Calculate range date selected
          let newRange = {
            left: +range.min + selection.left * (+range.max - range.min) / fullWidth.width,
            right: +range.min + selection.right * (+range.max - range.min) / fullWidth.width
          };
          scope.vm.chartConfig.onSelect(newRange);
        }
      );
    }
    let chart = elem.find('div').kendoChart(kendoChartOpts);
    scope.vm.instance = chart;

    // On resize chart function
    let onResizeChart = _.debounce(function () {
      let kendoChartDt = chart.data('kendoChart');
      if (kendoChartDt) {
        // Check if there is min width value
        if (Number(scope.vm.minWidth)) {
          // Set min width
          kendoChartDt.options.chartArea.width = (elem.width() > Number(scope.vm.minWidth) ? elem.width() : Number(scope.vm.minWidth));
        }
        let transitionsState = false;
        if (kendoChartDt.options.transitions) {
          kendoChartDt.options.transitions = false;
          transitionsState = true;
        }
        kendoChartDt.redraw();
        if (transitionsState) {
          kendoChartDt.options.transitions = true;
        }
      }
    }, 500);

    function onClosingWindow() {

      let selectorMngmt = elem.data('selectable');
      selectorMngmt && selectorMngmt.removeEvents();
      $(document).off('click.outside_' + scope.vm.windowId);
    }

    jQuery(window).off('resize.chart').on('resize.chart', onResizeChart);
    let eventWindow = windowsService.getWindow(scope.vm.windowId);
    if (eventWindow) {
      eventWindow.instance.on(wcDocker.EVENT.RESIZED, onResizeChart);
      eventWindow.instance.on(wcDocker.EVENT.CLOSED, onClosingWindow);
    }
    onResizeChart();
    scope.$on('$destroy', function () {

    });

  }

  function controllerFn() {

  }

  return {
    restrict: 'E',
    link: linkFn,
    controller: controllerFn,
    template: '<div></div>',
    bindToController: true,
    controllerAs: 'vm',
    scope: {
      chartConfig: '=',
      windowId: '@',
      instance: '=?',
      minWidth: '@'
    }
  };
});
export default module;
