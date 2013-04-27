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
