Zero.IsolationCallContext = (function() {
  function IsolationCallContext(uuid) {
    this.uuid = uuid;
    this.dependencies = [];
  }

  return IsolationCallContext;
})();
