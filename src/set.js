Zero.Set = (function() {
  "use strict";
  /**
   * Set element
   * @typedef {*} SetElement
   */

  /**
   * Create collection of unique elements
   * @param {...SetElement} elements
   * @constructor
   */
  function Set(elements) {
    /*#DEBUG*/
    if (elements && !Array.isArray(elements)) {
      throw new Error('Elements must be an array');
    }
    /*/DEBUG*/

    /** @member {..SetElement} */
    this.elements = elements || [];
  }

  var prototype = Set.prototype;

  /**
   * Check if element present in Set
   * @lends Set.prototype
   * @param {SetElement} element
   * @returns {boolean}
   */
  prototype.has = function(element) {
    return (this.elements.indexOf(element) >= 0);
  };

  /**
   * Add element to set
   * @lends Set.prototype
   * @param {SetElement} element
   */
  prototype.add = function(element) {
    if (!this.has(element)) {
      this.elements.push(element);
    }
  };

  /**
   * Remove elements from set
   * @lends Set.prototype
   * @param {SetElement} element
   */
  prototype.remove = function(element) {
    var index = this.elements.indexOf(element);

    if (index > 0) {
      this.elements.splice(index, 1);
    }
  };

  /**
   * Remove all elements from set
   * @lends Set.prototype
   */
  prototype.clear = function() {
    this.elements = [];
  };

  return Set;
})();
