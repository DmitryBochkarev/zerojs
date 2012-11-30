Zero = {};

Zero.uuid = (function() {
  var i = 1;

  return function () {
    return i++;
  };
})();

Zero.deferred = (function() {
  function deferred(wait, fn) {
    var timer;

    return function () {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(fn.bind(this), wait);
    };
  }

  return deferred;
})();

Zero.EventHandler = (function() {
  function EventHandler(fn, once) {
    this.fn = fn;
    this.once = !!once;
  }

  return EventHandler;
})();

Zero.EventEmitter = (function() {
  function EventEmitter() {
    this._handlers = {};
  }

  EventEmitter.prototype.on = function(event, handler) {
    var eventHandler = handler instanceof Zero.EventHandler ? handler : new Zero.EventHandler(handler, false);

    this._handlers[event] || (this._handlers[event] = []);
    this._handlers.push(eventHandler);
    
    return this;
  };

  EventEmitter.prototype.off = function(event, handler) {
    var eventHandler;

    if (!event) {
      this._handlers = {};
      return this;
    }

    if (!(this._handlers[event] && this._handlers[event].length > 0)) {
      return this;
    }

    if (!handler) {
      this._handlers[event] = [];
      return this;
    }

    eventHandler = handler instanceof Zero.EventHandler ? handler.fn : handler;

    this._handlers[event] = this._handlers[event].filter(function(h) {
      return h.fn !== eventHandler;
    });

    return this;
  };

  EventEmitter.prototype.once = function(event, handler) {
    var eventHandler = new Zero.EventHandler((handler instanceof Zero.EventHandler ? handler.fn : handler), true);
    
    return this.on(event, eventHandler);
  };

  EventEmitter.prototype.emit = function() {
    var event = arguments[0];
    var args;
    var self = this;

    if (!(this._handlers[event] && this._handlers[event].length > 0)) {
      return this;
    }

    args = Array.prototype.splice.call(arguments, 1);

    this._handlers[event] = this._handlers[event].filter(function(handler) {
      handler.fn.call(self, args);

      return !handler.once;
    });

    return this;
  };

  return EventEmitter;
})();

Zero.Isolation = (function() {
  function Isolation() {
    Zero.EventEmitter.call(this);

    var self = this;

    this._writeList = {};
    this._readList = {};

    this.on('read', function(uuid) {
      this._readList[uuid] = true;
      this.registerSubscribers();
    });

    this.on('write', function(uuid) {
      this._writeList[uuid] = true;
      this.runSubscribers();
    });
  }

  Isolation.prototype = new Zero.EventEmitter;

  Isolation.prototype.observable = function(initialValue) {
    var value = initialValue;
    var uuid = Zero.uuid();
    var isolation = this;
    
    function observable() {
      if (arguments.length > 0) {
        value = arguments[0];
        isolation.emit('write', uuid);

        return this;
      } else {
        isolation.emit('read', uuid);

        return value;
      }
    }

    return observable;
  };
  
  Isolation.prototype.computed = function(computeFn) {
    var value;
    var isolation = this;

    function compute() {
      var newValue;

      isolation.emit('start compute', uuid);

    }

    return compute;
  };

  return Isolation;
})();
