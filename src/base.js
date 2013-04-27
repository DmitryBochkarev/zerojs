/*#DEBUG*/

if (!window.Zero) {
  window.Zero = {};
}

window.Zero.DEBUG = {};

['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
  "use strict";

  Zero.DEBUG['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
});
/*/DEBUG*/

/**
 * Does nothing just return passing value
 * @param {*} [value]
 * @returns passed value
 */
Zero.noop = function(value) { return value; };

/**
 * Generate unique number
 * @returns {Integer} id
 */
Zero.id = (function() {
  "use strict";

  var i = 1;

  return function () {
    i++;
    return i;
  };
})();

/**
 * Milleseconds
 * @typedef {Integer} Milliseconds
 */

/**
 * Return function that deffer execution by wait time
 * @param {Milliseconds} wait
 * @param {Function} fn
 * @returns {Function} deffered function
 */
Zero.deferred = function(wait, fn) {
  "use strict";

  var timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn.bind(this), wait);
  };
};

