Zero.EventEmitter = (function() {
  "use strict";

  var EventHandler = Zero.EventHandler;

  function EventEmitter() {
    this._handlers = {};
  }

  var prototype = EventEmitter.prototype;

  prototype.on = function(event, handler) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isString(event)) {
      throw new Error('Event name must be a string');
    }

    if (!(Zero.DEBUG.isFunction(handler) || (handler instanceof EventHandler))) {
      throw new Error('Event handler must be a function or instance of EventHandler');
    }
    /*/DEBUG*/

    var eventHandler = handler instanceof EventHandler ? handler : new EventHandler(handler, false);
    var handlers = this._handlers;

    if (!handlers[event]) {
      handlers[event] = [];
    }

    handlers[event].push(eventHandler);

    return this;
  };

  prototype.off = function(event, handler) {
    /*#DEBUG*/
    if (event && !Zero.DEBUG.isString(event)) {
      throw new Error('Event name must be a string');
    }

    if (handler && !(Zero.DEBUG.isFunction(handler) || (handler instanceof EventHandler))) {
      throw new Error('Event handler must be a function or instance of EventHandler');
    }
    /*/DEBUG*/

    var eventHandler;
    var self = this;
    var handlers = self._handlers;

    if (!event) {
      handlers = self._handlers = {};
      return self;
    }

    if (!(handlers[event] && handlers[event].length > 0)) {
      return self;
    }

    if (!handler) {
      handlers[event] = [];
      return self;
    }

    eventHandler = handler instanceof EventHandler ? handler.fn : handler;

    handlers[event] = handlers[event].filter(function(h) {
      return h.fn !== eventHandler;
    });

    return self;
  };

  prototype.once = function(event, handler) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isString(event)) {
      throw new Error('Event name must be a string');
    }

    if (!(Zero.DEBUG.isFunction(handler) || (handler instanceof EventHandler))) {
      throw new Error('Event handler must be a function or instance of EventHandler');
    }
    /*/DEBUG*/

    var eventHandler = new EventHandler((handler instanceof EventHandler ? handler.fn : handler), true);

    return this.on(event, eventHandler);
  };

  prototype.emit = function() {
    var event = arguments[0];

    /*#DEBUG*/
    if (!Zero.DEBUG.isString(event)) {
      throw new Error('Event name must be a string');
    }
    /*/DEBUG*/

    var args;
    var self = this;
    var handlers = self._handlers;

    if (!(handlers[event] && handlers[event].length > 0)) {
      return self;
    }

    args = arguments.length > 1 ? Array.prototype.splice.call(arguments, 1) : [];

    handlers[event] = handlers[event].filter(function(handler) {
      handler.fn.apply(self, args);

      return !handler.once;
    });

    return self;
  };

  return EventEmitter;
})();
