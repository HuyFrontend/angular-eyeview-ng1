class Controller {
  /*@ngInject*/
  constructor(OverlayLoaderService,
              $element) {
    let self = this;
    self._overlayLoaderService = OverlayLoaderService;
    self._$element = $element;
    self._name = self.name;
  }

  /**
   * Add loader to ajax loader list on OverlayLoaderService
   */
  addLoader() {
    let self = this;
    self._overlayLoaderService.addLoader(self._name, self._$element);
  }

  $onInit(){
    let self = this;
    // Add loader to queued
    if (self._name) {
      self.addLoader();
    }
  }
}

export default Controller;
