Zero.EventHandler = (function() {
  function EventHandler(fn, once) {
    this.fn = fn;
    this.once = !!once;
  }

  return EventHandler;
})();

