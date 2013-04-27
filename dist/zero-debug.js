(function(Zero) {


/*#DEBUG*/

if (!window.Zero) {
  window.Zero = {};
}

window.Zero.DEBUG = {};

['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
  "use strict";

  Zero.DEBUG['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
});
/*/DEBUG*/

/**
 * Does nothing just return passing value
 * @param {*} [value]
 * @returns passed value
 */
Zero.noop = function(value) { return value; };

/**
 * Generate unique number
 * @returns {Integer} id
 */
Zero.id = (function() {
  "use strict";

  var i = 1;

  return function () {
    i++;
    return i;
  };
})();

/**
 * Milleseconds
 * @typedef {Integer} Milliseconds
 */

/**
 * Return function that deffer execution by wait time
 * @param {Milliseconds} wait
 * @param {Function} fn
 * @returns {Function} deffered function
 */
Zero.deferred = function(wait, fn) {
  "use strict";

  var timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn.bind(this), wait);
  };
};


Zero.Set = (function() {
  "use strict";
  /**
   * Set element
   * @typedef {*} SetElement
   */

  /**
   * Create collection of unique elements
   * @param {...SetElement} elements
   * @constructor
   */
  function Set(elements) {
    /*#DEBUG*/
    if (elements && !Array.isArray(elements)) {
      throw new Error('Elements must be an array');
    }
    /*/DEBUG*/

    /** @member {..SetElement} */
    this.elements = elements || [];
  }

  var prototype = Set.prototype;

  /**
   * Check if element present in Set
   * @lends Set.prototype
   * @param {SetElement} element
   * @returns {boolean}
   */
  prototype.has = function(element) {
    return (this.elements.indexOf(element) >= 0);
  };

  /**
   * Add element to set
   * @lends Set.prototype
   * @param {SetElement} element
   */
  prototype.add = function(element) {
    if (!this.has(element)) {
      this.elements.push(element);
    }
  };

  /**
   * Remove elements from set
   * @lends Set.prototype
   * @param {SetElement} element
   */
  prototype.remove = function(element) {
    var index = this.elements.indexOf(element);

    if (index > 0) {
      this.elements.splice(index, 1);
    }
  };

  /**
   * Remove all elements from set
   * @lends Set.prototype
   */
  prototype.clear = function() {
    this.elements = [];
  };

  return Set;
})();

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


Zero.EventEmitter = (function() {
  "use strict";

  var EventHandler = Zero.EventHandler;

  /**
   * EventEmitter
   * @constructor
   */
  function EventEmitter() {
    this._handlers = {};
  }

  var prototype = EventEmitter.prototype;

  /**
   * Register handler for event
   * @lends EventEmitter.prototype
   * @param {String} event
   * @param {Function|EventHandler} handler
   * @returns {EventEmitter} instance
   */
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

  /**
   * Remove handler for event if handler passed or remove all handlers for event if event passed or remove all handlers for instance
   * @lends EventEmitter.prototype
   * @param {String} [event]
   * @param {Function|EventHandler} [handler]
   * @returns {EventEmitter} instance
   */
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

  /**
   * Register onefire handler for event
   * @lends EventEmitter.prototype
   * @param {String} event
   * @param {Function|EventHandler} handler
   * @returns {EventEmitter} instance
   */
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

  /**
   * Fire event with params
   * @lends EventEmitter.prototype
   * @param {String} event
   * @param {...*} ...params
   * @returns {EventEmitter} instance
   */
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

Zero.Observable = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  /**
   * Create observable value
   * @param initialValue
   * @constructor
   */
  function Observable(initialValue) {
    var self = this;

    EventEmitter.call(self);

    self.id = Zero.id();
    self.value = initialValue;
  }

  var prototype = Observable.prototype = Object.create(EventEmitter.prototype);

  /**
   * Set new value to observable
   * @lends Observable.prototype
   * @param {*} newValue
   * @returns {Observable} instance
   */
  prototype.set = function(newValue) {
    var self = this;
    var oldValue = self.value;

    self.emit('set');

    if (oldValue !== newValue) {
      self.value = newValue;
      self.emit('change', newValue, oldValue);
    }

    return self;
  };

  /**
   * @lends Observable.prototype
   * @returns value of observable
   */
  prototype.get = function() {
    this.emit('get');

    return this.value;
  };

  return Observable;
})();

Zero.Computed = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  /**
   * Create Computed
   * @param {Function} computeFn
   * @constructor
   */
  function Computed(computeFn) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isFunction(computeFn)) {
      throw new Error('Computed should be a function');
    }
    /*/DEBUG*/

    var self = this;

    EventEmitter.call(self);

    self.id = Zero.id();
    self._computeFn = computeFn;
    self.value = undefined;
    self._shouldRecompute = true;
    self.lastContext = undefined;
  }

  var prototype = Computed.prototype = Object.create(EventEmitter.prototype);

  /**
   * Return computed value, recompute if should.
   * @lends Computed.prototype
   * @param context
   * @returns {*} value
   */
  prototype.get = function(context) {
    var self = this;
    var oldValue = self.value;
    var newValue;

    self.lastContext = context;

    self.emit('get');

    if (self._shouldRecompute) {
      self.emit('start');
      newValue = self._computeFn.call(context);
      self._shouldRecompute = false;
      self.emit('end');

      if (oldValue !== newValue) {
        self.value = newValue;
        self.emit('change', newValue, oldValue);
      }
    }

    return self.value;
  };

  /**
   * Force to recompute return computed value.
   * @returns {*} value
   */
  prototype.recompute = function() {
    this._shouldRecompute = true;
    return this.get(this.lastContext);
  };

  return Computed;
})();

Zero.Subscriber = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  /**
   * Create Subscriber
   * @param {Function} fn
   * @constructor
   */
  function Subscriber(fn) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isFunction(fn)) {
      throw new Error('Subscribe function must be a function');
    }
    /*/DEBUG*/

    var self = this;

    EventEmitter.call(self);

    self.id = Zero.id();
    self.fn = fn;
    self.lastContext = undefined;
  }

  var prototype = Subscriber.prototype = Object.create(EventEmitter.prototype);

  /**
   * Run subscriber
   * @param context
   * @returns {*} context
   */
  prototype.run = function(context) {
    var self = this;

    self.lastContext = context;

    self.emit('start');
    self.fn.call(context);
    self.emit('end');

    return context;
  };

  /**
   * Rerun subscriber in last context
   * @returns {*} context
   */
  prototype.rerun = function() {
    return this.run(this.lastContext);
  };

  return Subscriber;
})();

Zero.IsolationCallContext = (function() {
  "use strict";

  /**
   * Create IsolationCallContext
   * @param id
   * @constructor
   */
  function IsolationCallContext(id) {
    /*#DEBUG*/
    if (!id) {
      throw new Error('id must present');
    }
    /*/DEBUG*/

    this.id = id;
    this.dependencies = new Zero.Set();
    this.relations = new Zero.Set();
  }

  return IsolationCallContext;
})();

Zero.Isolation = (function() {
  "use strict";

  var IsolationCallContext = Zero.IsolationCallContext;

  /**
   * Create Isolation
   * @constructor
   */
  function Isolation() {
    var self = this;

    self._observables = {};
    self._computed = {};
    self._subscribers = {};

    self._callStack = [];
    self._currentIsolationCallContext = undefined;
    self._isolationCallContexts = {};

    self._computedToRecompute = new Zero.Set();
    self._subscribersToRerun = new Zero.Set();

    self.resolve = Zero.deferred(10, self.resolve);
  }

  var prototype = Isolation.prototype;

  /**
   * Create and register observable to isolation
   * @lends Isolation.prototype
   * @param initialValue
   * @returns {Function} observable
   */
  prototype.observable = function(initialValue) {
    var observable = new Zero.Observable(initialValue);

    return this.registerObservable(observable);
  };

  /**
   * Register observableInstance to isolation
   * @lends Isolation.prototype
   * @param {Observable} observableInstance
   * @returns {Function} observable
   */
  prototype.registerObservable = function(observableInstance) {
    var isolation = this;
    var id = observableInstance.id;

    isolation._observables[id] = observableInstance;

    observableInstance.on('get', function() {
      isolation.registerDependency(id);
    });

    observableInstance.on('change', function() {
      isolation.registerChanged(id);
    });

    function _observable(newValue) {
      /*jshint validthis:true*/

      if (arguments.length > 0) {
        observableInstance.set(newValue);

        return this;
      } else {
        return observableInstance.get();
      }
    }

    return _observable;
  };

  /**
   * Create and register computed to isolation
   * @lends Isolation.prototype
   * @param {Function} computeFn
   * @returns {Function} computed
   */
  prototype.computed = function(computeFn) {
    var computed = new Zero.Computed(computeFn);

    return this.registerComputed(computed);
  };

  /**
   * Register computedInstance to isolation
   * @lends Isolation.prototype
   * @param {Computed} computedInstance
   * @returns {Function} computed
   */
  prototype.registerComputed = function(computedInstance) {
    var isolation = this;
    var id = computedInstance.id;

    isolation._computed[id] = computedInstance;

    computedInstance.on('get', function() {
      isolation.registerDependency(id);
    });

    computedInstance.on('start', function() {
      isolation.setContext(id);
    });

    computedInstance.on('end', function() {
      isolation.closeContext();
    });

    computedInstance.on('change', function() {
      isolation.registerChanged(id);
    });

    function _computed() {
      /*jshint validthis:true*/

      return computedInstance.get(this);
    }

    return _computed;
  };

  prototype.subscribe = function(subscribeFn) {
    var subscriber = new Zero.Subscriber(subscribeFn);

    return this.registerSubscriber(subscriber);
  };

  prototype.registerSubscriber = function(subscriber) {
    var isolation = this;
    var id = subscriber.id;

    isolation._subscribers[id] = subscriber;

    subscriber.on('start', function() {
      isolation.setContext(id);
    });

    subscriber.on('end', function() {
      isolation.closeContext();
    });

    function _subscriber() {
      /*jshint validthis:true*/

      return subscriber.run(this);
    }

    return _subscriber;
  };

  prototype.deffer = function(binding, context) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isFunction(binding)) {
      throw new Error('Binding value must be a function');
    }
    /*/DEBUG*/

    var isolation = this;
    var currentIsolationCallContext = isolation._currentIsolationCallContext;

    function defferBinding() {
      /*jshint validthis:true*/

      isolation.setContext(currentIsolationCallContext.id, true);

      var result = binding.call(context || this);

      isolation.closeContext();

      return result;
    }

    return defferBinding;
  };

  prototype.setContext = function(id, saveDependencies) {
    var self = this;
    var currentContext = self._currentIsolationCallContext;
    var contexts = self._isolationCallContexts;

    if (currentContext) {
      self._callStack.unshift(currentContext);
    }

    if (!contexts[id]) {
      contexts[id] = new IsolationCallContext(id);
    }

    currentContext = self._currentIsolationCallContext = contexts[id];

    if (!saveDependencies) {
      currentContext.dependencies.elements.forEach(function(calledId) {
        self.removeRelation(id, calledId);
      });

      currentContext.dependencies.clear();
    }
  };

  prototype.closeContext = function() {
    this._currentIsolationCallContext = this._callStack.shift();
  };

  prototype.registerDependency = function(id) {
    var currentContext = this._currentIsolationCallContext;

    if (currentContext) {
      /*#DEBUG*/
      if (currentContext.relations.has(id)) {
        throw new Error('Recoursive call');
      }
      /*/DEBUG*/

      currentContext.dependencies.add(id);
      this.registerRelation(currentContext.id, id);
    }
  };

  prototype.registerRelation = function(callerId, calledId) {
    var contexts = this._isolationCallContexts;

    if (!contexts[calledId]) {
      contexts[calledId] = new IsolationCallContext(calledId);
    }

    /*#DEBUG*/
    if (contexts[calledId].dependencies.has(callerId)) {
      throw new Error('Recoursive call');
    }
    /*/DEBUG*/

    contexts[calledId].relations.add(callerId);
  };

  prototype.removeRelation = function(callerId, calledId) {
    var context = this._isolationCallContexts[calledId];

    context.relations.remove(callerId);
  };

  prototype.registerChanged = function(id) {
    var self = this ;
    var context = self._isolationCallContexts[id];
    var relations;

    if (context) {
      relations = context.relations.elements;

      if (relations.length > 0) {
        relations.forEach(function(id) {
          if (!self._currentIsolationCallContext || self._currentIsolationCallContext.id !== id) {
            if (self._computed[id]) {
              self._computedToRecompute.add(id);
            } else if (self._subscribers[id]) {
              self._subscribersToRerun.add(id);
            }
          }
        });

        self.resolve();
      }
    }
  };

  prototype.resolve = function() {
    var self = this;
    var computedId;
    var subscriberId;

    while (self._computedToRecompute.elements.length > 0) {
      computedId = self._computedToRecompute.elements.shift();
      self._computed[computedId].recompute();
    }

    while (self._subscribersToRerun.elements.length > 0) {
      subscriberId = self._subscribersToRerun.elements.shift();
      self._subscribers[subscriberId].rerun();
    }
  };

  return Isolation;
})();

})(window.Zero = {});
