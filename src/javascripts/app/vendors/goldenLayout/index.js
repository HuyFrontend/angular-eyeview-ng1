import GoldenLayout from 'golden-layout';
let lm = GoldenLayout.__lm;

lm.utils.copy(lm.items.AbstractContentItem.prototype, {
  /**
   * The tree of content items is created in two steps: First all content items are instantiated,
   * then init is called recursively from top to bottem. This is the basic init function,
   * it can be used, extended or overwritten by the content items
   *
   * Its behaviour depends on the content item
   *
   * @package private
   *
   * @returns {void}
   */
  _$init: function () {
    var i;
    this.setSize();

    for (i = 0; i < this.contentItems.length; i++) {
      this.childElementContainer.append(this.contentItems[i].element);
    }

    this.isInitialised = true;
    this.emitBubblingEvent('itemCreated');
    this.emitBubblingEvent(this.type + 'Created');

    // custom
    this.isPopup = false;
  },
  popup: function () {
    var popupWidth = window.innerWidth / 2;

    // Remove content item from parent to make parent full width/height
    this.parent.removeChild(this, true);

    // Create header
    this.popupStackControl = $(`<i class="lmp_popup_control lm_popin" title="Click to popin selected Stack"></i>`);
    this.popupStackControl.on('click', this._onPopinClick.bind(this));
    this.containerPopupHeader = $(`<div class="lm-popup-header lm_header"><ul class="lm_tabs"><li class="lm_tab lm_active" title="${this.config.title}" style="z-index: 1;"><span class="lm_title">${this.config.title}</span></li></ul></div>`);
    this.containerPopupHeader.find('.lm_title').after(this.popupStackControl);
    this.containerPopupHeader.on('mousedown', this._onPopupHeaderMouseDown.bind(this));
    this.containerPopupHeader.on('mouseup', this._onPopupHeaderMouseUp.bind(this));

    // Popup control
    this.popupControlContainer = $(`<ul class="lm_controls"></ul>`);
    this.popupCloseControl = $(`<li class="lm_close" title="close"></li>`);
    this.popupCloseControl.on('click', this._onPopupCloseClick.bind(this));
    this.popupControlContainer.append(this.popupCloseControl);

    // append control to header container
    this.containerPopupHeader.append(this.popupControlContainer);

    // append header
    this.element.prepend(this.containerPopupHeader);

    this.element.addClass('lm-popup');

    // set position
    this.element.css({
      width: popupWidth + 'px',
      top: '100px',
      left: (window.innerWidth / 2) - (popupWidth / 2)
    });

    // Append content item to body
    $(document.body).append(this.element);

    // Resize popup
    this.setSize();

    // TODO: find reason why the lm_content is bigger then 22px
    // This kind of hack to make the content width correct
    this.element.find('.lm_content').css({
      width: popupWidth + 'px'
    });

    this.element.show();
  },
  _onPopinClick: function () {
    var config = window.GL.componentConfigs[this.config.id];
    if(!config){
      alert('Sorry, can not find component configuration!');
      return;
    }
    if (window.GL.layout.selectedItem === null) {
      alert('No stack selected, please click to stack header to select one!');
    }
    else {
      window.GL.layout.selectedItem.addChild(config);
      delete window.GL.componentConfigs[this.config.id];
      this._onPopupCloseClick();
    }
  },
  _onPopupCloseClick: function () {
    this.container.onClose(this.element, ()=>{
      this.containerPopupHeader.off('mousedown');
      this.containerPopupHeader.off('mouseup');
      this.popupCloseControl.off('click');
      this.popupStackControl.on('click');
    });
  },
  _onMouseMove: function (e) {
    if (this.isPopupMoving) {
      var oX = e.pageX - this._startMovePosX;
      var oY = e.pageY - this._startMovePosY;
      this.element.css({
        top: this._startElemPostY + oY,
        left: this._startElemPostX + oX
      });
    }
  },
  _onPopupHeaderMouseDown: function (e) {
    this.isPopupMoving = true;
    this._startMovePosX = e.pageX;
    this._startMovePosY = e.pageY;
    this._startElemPostY = this.element.position().top;
    this._startElemPostX = this.element.position().left;
    $(document)
      .on('mousemove', this._onMouseMove.bind(this));
  },
  _onPopupHeaderMouseUp: function () {
    this.isPopupMoving = false;
    // TODO: need add handler reference
    $(document)
      .off('mousemove'/*, handler */);
  }
});

lm.utils.copy(lm.controls.DragProxy.prototype, {

  /**
   * Callback on every mouseMove event during a drag. Determines if the drag is
   * still within the valid drag area and calls the layoutManager to highlight the
   * current drop area
   *
   * @param   {Number} offsetX The difference from the original x position in px
   * @param   {Number} offsetY The difference from the original y position in px
   * @param   {jQuery DOM event} event
   *
   * @private
   *
   * @returns {void}
   */
  _onDrag: function (offsetX, offsetY, event) {
    var x = event.pageX,
      y = event.pageY,
      isWithinContainer = x > this._minX && x < this._maxX && y > this._minY && y < this._maxY;

    if (!isWithinContainer && this._layoutManager.config.settings.constrainDragToContainer === true) {
      return;
    }

    this._setDropPosition(x, y);
  },

  /**
   * Sets the target position, highlighting the appropriate area
   *
   * @param   {Number} x The x position in px
   * @param   {Number} y The y position in px
   *
   * @private
   *
   * @returns {void}
   */
  _setDropPosition: function (x, y) {
    this.element.css({left: x, top: y});

    this._area = this._layoutManager._$getArea(x, y);

    if (this._area !== null) {
      this._lastValidArea = this._area;
      this._area.contentItem._$highlightDropZone(x, y, this._area);
    }
  }
});


lm.utils.copy(lm.items.RowOrColumn.prototype, {

  /**
   * Removes a child of this element
   *
   * @param   {lm.items.AbstractContentItem} contentItem
   * @param   {boolean} keepChild   If true the child will be removed, but not destroyed
   *
   * @returns {void}
   */
  removeChild: function (contentItem, keepChild) {
    var removedItemSize = contentItem.config[this._dimension],
      index = lm.utils.indexOf(contentItem, this.contentItems),
      splitterIndex = Math.max(index - 1, 0),
      i,
      childItem;

    if (index === -1) {
      throw new Error('Can\'t remove child. ContentItem is not child of this Row or Column');
    }

    /**
     * Remove the splitter before the item or after if the item happens
     * to be the first in the row/column
     */
    if (this._splitter[splitterIndex]) {
      this._splitter[splitterIndex]._$destroy();
      this._splitter.splice(splitterIndex, 1);
    }

    /**
     * Allocate the space that the removed item occupied to the remaining items
     */
    for (i = 0; i < this.contentItems.length; i++) {
      if (this.contentItems[i] !== contentItem) {
        this.contentItems[i].config[this._dimension] += removedItemSize / ( this.contentItems.length - 1 );
      }
    }

    lm.items.AbstractContentItem.prototype.removeChild.call(this, contentItem, keepChild);

    if (this.contentItems.length === 1 && this.config.isClosable === true) {
      // THIS CODE WILL REPLACE LAST ITEM IN ROWORCOLUMN
      /*childItem = this.contentItems[ 0 ];
       this.contentItems = [];
       this.parent.replaceChild( this, childItem, true );*/
    } else {
      this.callDownwards('setSize');
      this.emitBubblingEvent('stateChanged');
    }
  }
});

export default GoldenLayout;
