Zero = {};

Zero.uuid = (function() {
  var i = 1;

  return function () {
    return i++;
  };
})();

Zero.deferred = (function() {
  function deferred(wait, fn) {
    var timer;

    return function () {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(fn.bind(this), wait);
    };
  }

  return deferred;
})();
