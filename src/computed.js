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
