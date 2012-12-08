Zero.IsolationCallContext = (function() {
  function IsolationCallContext(uuid) {
    /*#DEBUG*/
    if (!uuid) {
      throw new Error('uuid must present');
    }
    /*/DEBUG*/

    this.uuid = uuid;
    this.dependencies = [];
    this.relations = [];
  }

  return IsolationCallContext;
})();
