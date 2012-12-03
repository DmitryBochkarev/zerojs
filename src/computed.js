Zero.Computed = (function() {
  var EventEmitter = Zero.EventEmitter;

  function Computed(readComputeFn) {
    var self = this;

    EventEmitter.call(self);

    self.uuid = Zero.uuid();
    self.read = readComputeFn;
    self.value = undefined;
    self.shouldRecompute = true;
  }

  var prototype = Computed.prototype = new EventEmitter();

  prototype.get = function(context) {
    var self = this;
    var oldValue = self.value;
    var newValue;

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

  return Computed;
})();
