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
  var EventHandler = Zero.EventHandler;

  function EventEmitter() {
    this._handlers = {};
  }
  
  var prototype = EventEmitter.prototype;

  prototype.on = function(event, handler) {
    var eventHandler = handler instanceof EventHandler ? handler : new EventHandler(handler, false);
    var handlers = this._handlers;

    if (!handlers[event]) {
      handlers[event] = [];
    }  

    handlers[event].push(eventHandler);
    
    return this;
  };

  prototype.off = function(event, handler) {
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
    var eventHandler = new EventHandler((handler instanceof EventHandler ? handler.fn : handler), true);
    
    return this.on(event, eventHandler);
  };

  prototype.emit = function() {
    var event = arguments[0];
    var args;
    var self = this;
    var handlers = self._handlers;

    if (!(handlers[event] && handlers[event].length > 0)) {
      return self;
    }

    args = Array.prototype.splice.call(arguments, 1);

    handlers[event] = handlers[event].filter(function(handler) {
      handler.fn.apply(self, args);

      return !handler.once;
    });

    return self;
  };

  return EventEmitter;
})();

Zero.Observable = (function() {
  var EventEmitter = Zero.EventEmitter;

  function Observable(initialValue) {
    EventEmitter.call(this);

    this.uuid = Zero.uuid();
    this.value = initialValue;
  }

  var prototype = Observable.prototype = new EventEmitter();

  prototype.set = function(value) {
    var self = this;
    var oldValue = self.value;

    self.emit('set');

    if (oldValue !== value) {
      self.value = value;
      self.emit('change', value, oldValue);
    }

    return self;
  };

  prototype.get = function() {
    this.emit('get');

    return this.value;
  };

  return Observable;
})();

Zero.Computed = (function() {
  var EventEmitter = Zero.EventEmitter;

  function Computed(computeFn) {
    var self = this;

    EventEmitter.call(self);

    self.uudi = Zero.uuid();
    self.fn = computeFn;
    self.value = null;
    self.shouldRecompute = true;
  }

  var prototype = Computed.prototype = new EventEmitter();

  prototype.get = function(context) {
    var self = this;
    var oldValue = self.value;
    var newValue;

    self.emit('get');

    if (self.shouldRecompute) {
      self.emit('start compute');
      newValue = self.fn.call(context);
      self.shouldRecompute = false;
      self.emit('end compute');

      if (oldValue !== newValue) {
        self.value = newValue;
        self.emit('change', newValue, oldValue);
      }
    }

    return self.value;
  };

  return Computed;
})();

Zero.Isolation = (function() {
  var EventEmitter = Zero.EventEmitter;

  function Isolation() {
    EventEmitter.call(this);

    this.observables = {};
    this.computed = {};
  }

  var prototype = Isolation.prototype = new EventEmitter();

  prototype.observable = function(initialValue) {
    var observable = new Zero.Observable(initialValue);

    return this.registerObservable(observable);
  };

  prototype.registerObservable = function(observable) {
    var isolation = this;
    var uuid = observable.uuid;

    isolation.observables[uuid] = observable;
    
    observable.on('get', function() {
      isolation.emit('read:observable', uuid);
    });

    observable.on('change', function() {
      isolation.emit('write:observable', uuid);
    });

    function _observable() {
      if (arguments.length > 0) {
        observable.set(arguments[0]);

        return this;
      } else {
        return observable.get();
      }
    }

    return _observable;
  };

  prototype.computed = function(computeFn) {
    var computed = new Zero.Computed(computeFn);

    return this.registerComputed(computed);
  };

  prototype.registerComputed = function(computed) {
    var isolation = this;
    var uuid = computed.uuid;

    isolation.computed[uuid] = computed;

    computed.on('get', function() {
      isolation.emit('read:computed', uuid);
    });

    computed.on('change', function() {
      isolation.emit('write:computed', uuid);
    });

    computed.on('start compute', function() {
      isolation.emit('start compute', uuid);
    });

    computed.on('end compute', function() {
      isolation.emit('end compute', uuid);
    });
    
    function _computed() {
      return computed.get(this);
    }

    return _computed;
  };

  return Isolation;
})();
