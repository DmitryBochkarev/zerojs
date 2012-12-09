/*#DEBUG*/
if (!window.Zero) {
  Zero = {};
}

Zero.DEBUG = {};

['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'].forEach(function(name) {
  Zero.DEBUG['is' + name] = function(obj) {
    return Object.prototype.toString.call(obj) == '[object ' + name + ']';
  };
});
/*/DEBUG*/

Zero.noop = function(val) { return val; };

Zero.uuid = (function() {
  var i = 1;

  return function () {
    return i++;
  };
})();

Zero.deferred = function(wait, fn) {
  var timer;

  return function () {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn.bind(this), wait);
  };
};

