Zero.Computed = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  function Computed(readComputeFn) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isFunction(readComputeFn)) {
      throw new Error('Computed should be a function');
    }
    /*/DEBUG*/

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
      self.emit('end');

      if (oldValue !== newValue) {
        self.value = newValue;
        self.emit('change', newValue, oldValue);
      }
    }

    return self.value;
  };

  prototype.recompute = function() {
    this.shouldRecompute = true;
    return this.get(this.lastContext);
  };

  return Computed;
})();
