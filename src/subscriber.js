Zero.Subscriber = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  /**
   * Create Subscriber
   * @param {Function} fn
   * @constructor
   */
  function Subscriber(fn) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isFunction(fn)) {
      throw new Error('Subscribe function must be a function');
    }
    /*/DEBUG*/

    var self = this;

    EventEmitter.call(self);

    self.id = Zero.id();
    self.fn = fn;
    self.lastContext = undefined;
  }

  var prototype = Subscriber.prototype = Object.create(EventEmitter.prototype);

  /**
   * Run subscriber
   * @param context
   * @returns {*} context
   */
  prototype.run = function(context) {
    var self = this;

    self.lastContext = context;

    self.emit('start');
    self.fn.call(context);
    self.emit('end');

    return context;
  };

  /**
   * Rerun subscriber in last context
   * @returns {*} context
   */
  prototype.rerun = function() {
    return this.run(this.lastContext);
  };

  return Subscriber;
})();
