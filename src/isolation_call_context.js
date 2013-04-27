Zero.IsolationCallContext = (function() {
  "use strict";

  /**
   * Create IsolationCallContext
   * @param id
   * @constructor
   */
  function IsolationCallContext(id) {
    /*#DEBUG*/
    if (!id) {
      throw new Error('id must present');
    }
    /*/DEBUG*/

    this.id = id;
    this.dependencies = new Zero.Set();
    this.relations = new Zero.Set();
  }

  return IsolationCallContext;
})();
