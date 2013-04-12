/*#DEBUG*/
if (!window.Zero) {
  window.Zero = {};
}

Zero.DEBUG = {};

['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
  "use strict";

  Zero.DEBUG['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) === '[object ' + name + ']';
  };
});
/*/DEBUG*/

Zero.noop = function(val) { return val; };

Zero.uuid = (function() {
  "use strict";

  var i = 1;

  return function () {
    i++;
    return i;
  };
})();

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

