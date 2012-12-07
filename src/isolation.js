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
    self.contexts = {};

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
      this.registerRelation(this.currentContext.uuid, uuid);
    }
  };

  prototype.registerRelation = function(callerUuid, calledUuid) {
    if (!this.contexts[calledUuid]) {
      this.contexts[calledUuid] = new Zero.IsolationCallContext();
    }

    this.contexts[calledUuid].relations.push(callerUuid);
  };

  prototype.removeRelation = function(callerUuid, calledUuid) {
    this.contexts[calledUuid].relations = this.contexts[calledUuid].relations.filter(function(uuid) {
      return uuid !== callerUuid;
    });
  };

  prototype.setContext = function(uuid) {
    var self = this;

    if (self.currentContext) {
      self.callStack.unshift(self.currentContext);
    }

    if (!self.contexts[uuid]) {
      self.contexts[uuid] = new Zero.IsolationCallContext(uuid);
    }

    self.currentContext = self.contexts[uuid];

    self.currentContext.dependencies.forEach(function(calledUuid) {
      self.removeRelation(uuid, calledUuid);
    });

    self.currentContext.dependencies = [];
  };

  prototype.closeContext = function() {
    this.currentContext = this.callStack.shift();
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
