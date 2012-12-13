Zero.Observable = (function() {
  var EventEmitter = Zero.EventEmitter;

  function Observable(initialValue) {
    EventEmitter.call(this);

    this.uuid = Zero.uuid();
    this.value = initialValue;
  }

  var prototype = Observable.prototype = Object.create(EventEmitter.prototype);

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

  prototype.get = function() {
    this.emit('get');

    return this.value;
  };

  return Observable;
})();
