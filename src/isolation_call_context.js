Zero.IsolationCallContext = (function() {
  "use strict";

  /**
   * Create IsolationCallContext
   * @param uuid
   * @constructor
   */
  function IsolationCallContext(uuid) {
    /*#DEBUG*/
    if (!uuid) {
      throw new Error('uuid must present');
    }
    /*/DEBUG*/

    this.uuid = uuid;
    this.dependencies = new Zero.Set();
    this.relations = new Zero.Set();
  }

  return IsolationCallContext;
})();
