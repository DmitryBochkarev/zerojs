describe('Zero.EventHandler', function() {
  if (Zero.DEBUG) {
    describe('DEBUG', function() {
      it('should throw error when event handler non a function', function() {
        var fn = function() {
          new Zero.EventHandler();
        };

        expect(fn).to.throw('Event handler must be a function');
      });
    });
  }
});
