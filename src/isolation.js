Zero.Isolation = (function() {
  "use strict";

  var IsolationCallContext = Zero.IsolationCallContext;

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

  prototype.observable = function(initialValue) {
    var observable = new Zero.Observable(initialValue);

    return this.registerObservable(observable);
  };

  prototype.registerObservable = function(observable) {
    var isolation = this;
    var uuid = observable.uuid;

    isolation._observables[uuid] = observable;

    observable.on('get', function() {
      isolation.registerDependency(uuid);
    });

    observable.on('change', function() {
      isolation.registerChanged(uuid);
    });

    function _observable(newValue) {
      /*jshint validthis:true*/

      if (arguments.length > 0) {
        observable.set(newValue);

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

    isolation._computed[uuid] = computed;

    computed.on('get', function() {
      isolation.registerDependency(uuid);
    });

    computed.on('start', function() {
      isolation.setContext(uuid);
    });

    computed.on('end', function() {
      isolation.closeContext();
    });

    computed.on('change', function() {
      isolation.registerChanged(uuid);
    });

    function _computed() {
      /*jshint validthis:true*/

      return computed.get(this);
    }

    return _computed;
  };

  prototype.subscribe = function(subscribeFn) {
    var subscriber = new Zero.Subscriber(subscribeFn);

    return this.registerSubscriber(subscriber);
  };

  prototype.registerSubscriber = function(subscriber) {
    var isolation = this;
    var uuid = subscriber.uuid;

    isolation._subscribers[uuid] = subscriber;

    subscriber.on('start', function() {
      isolation.setContext(uuid);
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

      isolation.setContext(currentIsolationCallContext.uuid, true);

      var result = binding.call(context || this);

      isolation.closeContext();

      return result;
    }

    return defferBinding;
  };

  prototype.setContext = function(uuid, saveDependencies) {
    var self = this;
    var currentContext = self._currentIsolationCallContext;
    var contexts = self._isolationCallContexts;

    if (currentContext) {
      self._callStack.unshift(currentContext);
    }

    if (!contexts[uuid]) {
      contexts[uuid] = new IsolationCallContext(uuid);
    }

    currentContext = self._currentIsolationCallContext = contexts[uuid];

    if (!saveDependencies) {
      currentContext.dependencies.elements.forEach(function(calledUuid) {
        self.removeRelation(uuid, calledUuid);
      });

      currentContext.dependencies.clear();
    }
  };

  prototype.closeContext = function() {
    this._currentIsolationCallContext = this._callStack.shift();
  };

  prototype.registerDependency = function(uuid) {
    var currentContext = this._currentIsolationCallContext;

    if (currentContext) {
      /*#DEBUG*/
      if (currentContext.relations.has(uuid)) {
        throw new Error('Recoursive call');
      }
      /*/DEBUG*/

      currentContext.dependencies.add(uuid);
      this.registerRelation(currentContext.uuid, uuid);
    }
  };

  prototype.registerRelation = function(callerUuid, calledUuid) {
    var contexts = this._isolationCallContexts;

    if (!contexts[calledUuid]) {
      contexts[calledUuid] = new IsolationCallContext(calledUuid);
    }

    /*#DEBUG*/
    if (contexts[calledUuid].dependencies.has(callerUuid)) {
      throw new Error('Recoursive call');
    }
    /*/DEBUG*/

    contexts[calledUuid].relations.add(callerUuid);
  };

  prototype.removeRelation = function(callerUuid, calledUuid) {
    var context = this._isolationCallContexts[calledUuid];

    context.relations.remove(callerUuid);
  };

  prototype.registerChanged = function(uuid) {
    var self = this ;
    var context = self._isolationCallContexts[uuid];
    var relations;

    if (context) {
      relations = context.relations.elements;

      if (relations.length > 0) {
        relations.forEach(function(uuid) {
          if (!self._currentIsolationCallContext || self._currentIsolationCallContext.uuid !== uuid) {
            if (self._computed[uuid]) {
              self._computedToRecompute.add(uuid);
            } else if (self._subscribers[uuid]) {
              self._subscribersToRerun.add(uuid);
            }
          }
        });

        self.resolve();
      }
    }
  };

  prototype.resolve = function() {
    var self = this;
    var computedUuid;
    var subscriberUuid;

    while (self._computedToRecompute.elements.length > 0) {
      computedUuid = self._computedToRecompute.elements.shift();
      self._computed[computedUuid].recompute();
    }

    while (self._subscribersToRerun.elements.length > 0) {
      subscriberUuid = self._subscribersToRerun.elements.shift();
      self._subscribers[subscriberUuid].rerun();
    }
  };

  return Isolation;
})();
