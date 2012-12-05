Zero.Subscriber = (function() {
  var EventEmitter = Zero.EventEmitter;
  function Subscriber(fn) {
    var self = this;

    EventEmitter.call(self);

    self.uuid = Zero.uuid();
    self.fn = fn;
    self.lastContext = undefined;
  }

  var prototype = Subscriber.prototype = new EventEmitter();

  prototype.run = function(context) {
    var self = this;
    
    self.lastContext = context;

    self.emit('start');
    self.fn.call(context);
    self.emit('end');

    return context;
  };

  prototype.reRun = function() {
    return this.run(this.lastContext);
  };

  return Subscriber;
})();
