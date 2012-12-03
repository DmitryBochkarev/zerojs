Zero.Subscriber = (function() {
  var EventEmitter = Zero.EventEmitter;
  function Subscriber(fn) {
    EventEmitter.call(this);

    this.uuid = Zero.uuid();
    this.fn = fn;
  }

  var prototype = Subscriber.prototype = new EventEmitter();

  prototype.run = function(context) {
    this.emit('start');
    this.fn.call(context);
    this.emit('end');

    return context;
  };

  return Subscriber;
})();
