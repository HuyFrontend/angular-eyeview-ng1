/*@ngInject*/
export default class OverlayLoaderService {
  constructor($q,
              $timeout,
              $log) {
    let self = this;
    self._$q = $q;
    self._overlayLoaders = {};
    self._$timeout = $timeout;
    self._$log = $log;
  }

  /**
   * Initialize for overlay loader
   * @param name
   * @param tried
   * @returns {null}
   */
  init(name, tried = 0) {
    let self = this;
    if (!self._overlayLoaders[name]) {
      self._overlayLoaders[name] = {
        defer: self._$q.defer(),
        show: (cb) => {
          let instance = this._overlayLoaders[name];
          if (instance.$element) {
            instance.$element.removeClass('hide');
            if (cb) {
              cb();
            }
          } else {
            instance.defer.promise.then(() => {
              instance.$element.removeClass('hide');
              if (cb) {
                cb();
              }
            });
          }
        },
        hide: (cb) => {
          let instance = this._overlayLoaders[name];
          if (instance.$element) {
            instance.$element.addClass('hide');
            if (cb) {
              cb();
            }
          } else {
            instance.defer.promise.then(() => {
              instance.$element.addClass('hide');
              if (cb) {
                cb();
              }
            });
          }
        }
      };
    }

    if (!self._overlayLoaders[name].$element) {
      if (tried >= 10) {
        return null;
      }
      self._$timeout(() => {
        self.init(name, tried + 1);
      }, 100);
    } else {
      self._overlayLoaders[name] && self._overlayLoaders[name].defer && self._overlayLoaders[name].defer.resolve();
    }

    return self._overlayLoaders[name];
  }

  /**
   * Add a loader to queue
   * @param name
   * @param $element
   */
  addLoader(name, $element) {
    let self = this;
    $element.addClass('hide');

    // Setup functions for loader instance
    if (self._overlayLoaders[name]) {
      self._overlayLoaders[name].$element = $element;
    } else {
      self._overlayLoaders[name] = {
        $element: $element
      };
    }

    return self._overlayLoaders[name];
  }

  /**
   * Find a loader by name
   * @param name
   * @returns {null}
   */
  destroy(name) {
    let self = this;
    delete self._overlayLoaders[name];
  }
}
