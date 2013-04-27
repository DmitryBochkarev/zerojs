Zero.Observable = (function() {
  "use strict";

  var EventEmitter = Zero.EventEmitter;

  /**
   * Create observable value
   * @param initialValue
   * @constructor
   */
  function Observable(initialValue) {
    var self = this;

    EventEmitter.call(self);

    self.id = Zero.id();
    self.value = initialValue;
  }

  var prototype = Observable.prototype = Object.create(EventEmitter.prototype);

  /**
   * Set new value to observable
   * @lends Observable.prototype
   * @param {*} newValue
   * @returns {Observable} instance
   */
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

  /**
   * @lends Observable.prototype
   * @returns value of observable
   */
  prototype.get = function() {
    this.emit('get');

    return this.value;
  };

  return Observable;
})();
