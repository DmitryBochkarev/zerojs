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
