Zero = {};

Zero.noop = function(val) { return val; };

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

  var prototype = Observable.prototype = Object.create(EventEmitter.prototype);

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

  function Computed(readComputeFn) {
    var self = this;

    EventEmitter.call(self);

    self.uuid = Zero.uuid();
    self.read = readComputeFn;
    self.value = undefined;
    self.shouldRecompute = true;
    self.lastContext = undefined;
  }

  var prototype = Computed.prototype = Object.create(EventEmitter.prototype);

  prototype.get = function(context) {
    var self = this;
    var oldValue = self.value;
    var newValue;

    self.lastContext = context;
    self.emit('get');

    if (self.shouldRecompute) {
      self.emit('start');
      newValue = self.read.call(context);
      self.shouldRecompute = false;

      if (oldValue !== newValue) {
        self.value = newValue;
        self.emit('change', newValue, oldValue);
      }

      self.emit('end');
    }

    return self.value;
  };

  prototype.recompute = function() {
    return this.get(this.lastContext);
  };

  return Computed;
})();

Zero.Subscriber = (function() {
  var EventEmitter = Zero.EventEmitter;
  function Subscriber(fn) {
    var self = this;

    EventEmitter.call(self);

    self.uuid = Zero.uuid();
    self.fn = fn;
    self.lastContext = undefined;
  }

  var prototype = Subscriber.prototype = Object.create(EventEmitter.prototype);

  prototype.run = function(context) {
    var self = this;
    
    self.lastContext = context;

    self.emit('start');
    self.fn.call(context);
    self.emit('end');

    return context;
  };

  prototype.rerun = function() {
    return this.run(this.lastContext);
  };

  return Subscriber;
})();

Zero.IsolationCallContext = (function() {
  function IsolationCallContext(uuid) {
    this.uuid = uuid;
    this.dependencies = [];
  }

  return IsolationCallContext;
})();

Zero.Isolation = (function() {
  var EventEmitter = Zero.EventEmitter;

  function Isolation() {
    var self = this;
    EventEmitter.call(self);

    self.observables = {};
    self.computed = {};
    self.subscribers = {};
    self.callStack = [];
    self.currentContext = undefined;
    self.dependencies = {};

    self.on('read:observable', registerDependency);
    self.on('read:computed', registerDependency);
    self.on('start:computed', setContext);
    self.on('end:computed', closeContext);
    self.on('start:subscriber', setContext);
    self.on('end:subscriber', closeContext);

    function registerDependency(uuid) {
      self.registerDependency(uuid);
    }

    function setContext(uuid) {
      self.setContext(uuid);
    }

    function closeContext(uuid) {
      self.closeContext();
    }
  }

  var prototype = Isolation.prototype = Object.create(EventEmitter.prototype);

  prototype.registerDependency = function(uuid) {
    if (this.currentContext) {
      /*#DEBUG*/
      if (this.currentContext.uuid == uuid) {
        throw new Error('Recoursive call');
      }
      /*/DEBUG*/
      this.currentContext.dependencies.push(uuid);
    }
  };

  prototype.setContext = function(uuid) {
    var self = this;

    if (self.currentContext) {
      self.callStack.unshift(self.currentContext);
    }

    self.currentContext = new Zero.IsolationCallContext(uuid);
  };

  prototype.closeContext = function() {
    var self = this;
    
    self.dependencies[self.currentContext.uuid] = self.currentContext.dependencies;

    self.currentContext = self.callStack.shift();
  };

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

    computed.on('start', function() {
      isolation.emit('start:compute', uuid);
    });

    computed.on('end', function() {
      isolation.emit('end:compute', uuid);
    });
    
    function _computed() {
      return computed.get(this);
    }

    return _computed;
  };

  prototype.subscribe = function(subscribeFn) {
    var subscriber = new Zero.Subscriber();

    return this.registerSubscriber(subscriber);
  };

  prototype.registerSubscriber = function(subscriber) {
    var isolation = this;
    var uuid = subscriber.uuid;

    isolation.subscribers[uuid] = subscriber;

    subscriber.on('start', function() {
      isolation.emit('start:subscriber', uuid);
    });

    subscriber.on('end', function() {
      isolation.emit('end:subscriber', uuid);
    });

    function _subscriber() {
      return subscriber.run(this);
    }
    
    return _subscriber;
  };

  return Isolation;
})();
