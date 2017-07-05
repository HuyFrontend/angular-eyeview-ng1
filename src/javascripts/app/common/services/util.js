import angular from "angular";
let module = angular.module('common.services.util', []);
module.factory('utilFactory', () => {
  'ngInject';
  var services = {};
  /**
   * @param {DOMElement} element
   * @param {string} className
   * @returns {DOMElement} The closest parent of element matching the
   * className, or null.
   */
  services.getParentWithClass = function (e, className, depth) {
    depth = depth || 10;
    while (e.parentNode && depth--) {
      if (e.parentNode.classList && e.parentNode.classList.contains(className)) {
        return e.parentNode;
      }
      e = e.parentNode;
    }
    return null;
  };

  /**
   * @param {DOMElement} element
   * @param {string} className
   * @returns {DOMElement} The closest parent or self matching the
   * className, or null.
   */
  services.getParentOrSelfWithClass = function (e, className, depth) {
    depth = depth || 10;
    while (e && depth--) {
      if (e.classList && e.classList.contains(className)) {
        return e;
      }
      e = e.parentNode;
    }
    return null;
  };

  services.newGuid = function () {
    function guid() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    return guid();
  };

  services.makeId = function (l) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (var i = 0; i < l; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  };

  /**
   * Generate color for chart
   * @param count
   * @returns {Array}
   */
  services.generateColor = function (count) {
    var res = [];
    for (var i = 0; i < count; i++) {
      var r = Math.floor((255 * i) / count),
        g = (r + i * count ) % 255,
        b = (r + g + i * count) % 255;
      res.push("rgb(" + r + "," + g + "," + b + ")");
    }
    return res;
  };

  services.camelToRegularForm = function (camelStr) {
    // insert a space before all caps
    return camelStr.replace(/([A-Z])/g, ' $1')
    // uppercase the first character
      .replace(/^./, function (str) {
        return str.toUpperCase();
      })
  }

  /**
   * function return random color, ex: "#019ABF"
   * See: http://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/
   */
  services.randomColor = (function () {
    let golden_ratio_conjugate = 0.618033988749895;
    let h = Math.random();

    let hslToRgb = function (h, s, l) {
      let r, g, b;

      if (s == 0) {
        r = g = b = l; // achromatic
      } else {
        function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        let p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return '#' + Math.round(r * 255).toString(16) + Math.round(g * 255).toString(16) + Math.round(b * 255).toString(16);
    };

    return function () {
      h += golden_ratio_conjugate;
      h %= 1;
      return hslToRgb(h, 0.5, 0.60);
    };
  })();
  services.validateFileExtension = function (files, ext) {
    if (!files) {
      return;
    }

    return !_.filter(files, function (f) {
      return !f.name.toLowerCase().endsWith(ext);
    }).length;
  };
  return services;
});
export default module;
