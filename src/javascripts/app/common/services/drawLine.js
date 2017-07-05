import angular from 'angular';
let module = angular.module('common.services.drawLine', []);

module.factory('DrawLine', () => {
  'ngInject';
  var drawLine = L.Draw.SimpleShape.extend({
    statics: {
      TYPE: 'line'
    },

    options: {
      shapeOptions: {
        stroke: true,
        color: 'blue',
        weight: 4,
        opacity: 0.5,
        fill: true,
        fillColor: null, //same as color by default
        fillOpacity: 0.2,
        clickable: true
      },
      metric: true // Whether to use the metric meaurement system or imperial
    },

    initialize: function (map, options) {
      // Save the type so super can fire, need to do this as cannot do this.TYPE :(
      this.type = drawLine.TYPE;

      // this._initialLabelText = L.drawLocal.draw.handlers.line.tooltip.start;
      this._initialLabelText = "Click and drag to draw";

      L.Draw.SimpleShape.prototype.initialize.call(this, map, options);
    },

    _drawShape: function (latlng) {
      if (!this._shape) {
        this._shape = new L.Line(this._startLatLng, this.options.shapeOptions);
        this._map.addLayer(this._shape);
      } else {
        this._shape.setLatLngs([this._startLatLng, latlng]);
      }
    },

    _fireCreatedEvent: function () {
      var line = new L.Line(this._shape.getLatLngs(), this.options.shapeOptions);
      L.Draw.SimpleShape.prototype._fireCreatedEvent.call(this, line);
    },

    _getTooltipText: function () {
      var tooltipText = L.Draw.SimpleShape.prototype._getTooltipText.call(this),
        shape = this._shape,
        latLngs, distance, subtext;

      if (shape) {
        latLngs = this._shape.getLatLngs();
        if (latLngs.length > 1) {
          distance = latLngs[1].distanceTo(latLngs[0]);
          subtext = L.GeometryUtil.readableDistance(distance, this.options.metric);
        }
      }

      return {
        text: tooltipText.text,
        subtext: subtext
      };
    },

    _onMouseDown: function (e) {
      this._isDrawing = true;
      if (this.options.startLatLng) {
        this._startLatLng = this.options.startLatLng;
      } else {
        this._startLatLng = e.latlng;
      }

      L.DomEvent
        .on(document, 'mouseup', this._onMouseUp, this)
        .preventDefault(e.originalEvent);
    },

    _onMouseUp: function (e) {
      if (this._shape) {
        this._fireCreatedEvent();
      }

      this.disable();
      if (this.options.repeatMode) {
        this.enable();
      }
    }
  });

  return drawLine;

});
export default module;
