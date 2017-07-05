import * as _ from 'lodash';
import $ from 'jquery';
class Controller {
  /*@ngInject*/
  constructor() {
    let self = this;
    if (_.isObject(self.container)) {
      self.container._contentElement.bind('scroll.item', self.onEvent.bind(self))
    }
    if (_.isString(self.container)) {
      $(self.container).bind('scroll.item', self.onEvent.bind(self))
    }

  }

  onEvent(e) {
    let self = this;
    if (e.target.scrollHeight - e.target.scrollTop < e.target.clientHeight + 100) {
      self.event();
    }
  }

  $onDestroy() {
    let self = this;
    if (_.isObject(self.container)) {
      self.container._contentElement.unbind('scroll.item');
    }
    if (_.isString(self._container)) {
      $(self._container).unbind('scroll.item');
    }
  }
}

export default Controller;
