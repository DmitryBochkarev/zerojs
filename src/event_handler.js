Zero.EventHandler = (function() {
  function EventHandler(fn, once) {
    /*#DEBUG*/
    if (typeof fn !== 'function') {
      throw new Error('Event handler must be a function');
    }
    /*/DEBUG*/

    this.fn = fn;
    this.once = !!once;
  }

  return EventHandler;
})();

