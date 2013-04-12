Zero.EventHandler = (function() {
  "use strict";

  /**
   * EventHandler
   * @param {Function} handler
   * @param {Boolean} once
   * @constructor
   */
  function EventHandler(handler, once) {
    /*#DEBUG*/
    if (typeof handler !== 'function') {
      throw new Error('Event handler must be a function');
    }
    /*/DEBUG*/

    this.fn = handler;
    this.once = !!once;
  }

  return EventHandler;
})();

