Zero.Computed = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  /**
   * Create Computed
   * @param {Function} computeFn
   * @constructor
   */
  function Computed(computeFn) {
    /*#DEBUG*/
    if (!Zero.DEBUG.isFunction(computeFn)) {
      throw new Error('Computed should be a function');
    }
    /*/DEBUG*/

    var self = this;

    EventEmitter.call(self);

    self.id = Zero.id();
    self._computeFn = computeFn;
    self.value = undefined;
    self._shouldRecompute = true;
    self.lastContext = undefined;
  }

  var prototype = Computed.prototype = Object.create(EventEmitter.prototype);

  /**
   * Return computed value, recompute if should.
   * @lends Computed.prototype
   * @param context
   * @returns {*} value
   */
  prototype.get = function(context) {
    var self = this;
    var oldValue = self.value;
    var newValue;

    self.lastContext = context;

    self.emit('get');

    if (self._shouldRecompute) {
      self.emit('start');
      newValue = self._computeFn.call(context);
      self._shouldRecompute = false;
      self.emit('end');

      if (oldValue !== newValue) {
        self.value = newValue;
        self.emit('change', newValue, oldValue);
      }
    }

    return self.value;
  };

  /**
   * Force to recompute return computed value.
   * @lends Computed.prototype
   * @returns {*} recomputed value
   */
  prototype.recompute = function() {
    this._shouldRecompute = true;
    return this.get(this.lastContext);
  };

  return Computed;
})();
