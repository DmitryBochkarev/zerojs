Zero.Set = (function() {
  function Set(elements) {
    /*#DEBUG*/
    if (elements && !Array.isArray(elements)) {
      throw new Error('Elements must be an array');
    }
    /*/DEBUG*/

    this.elements = elements || [];
  }
  
  var prototype = Set.prototype;

  prototype.has = function(element) {
    return (this.elements.indexOf(element) >= 0);
  };

  prototype.add = function(element) {
    if (!this.has(element)) {
      this.elements.push(element);
    }
  };

  prototype.remove = function(element) {
    var index = this.elements.indexOf(element);

    if (index > 0) {
      this.elements.splice(index, 1);
    }
  };

  prototype.clear = function() {
    this.elements = [];
  };

  return Set;
})();
