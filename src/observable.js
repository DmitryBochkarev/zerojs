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
