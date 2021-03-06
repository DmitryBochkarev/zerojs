describe('Zero.IsolationCallContext', function() {
  if (Zero.DEBUG) {
    describe('DEBUG', function() {
      it('should throw error when uuid not passed', function() {
        var fn = function() {
          new Zero.IsolationCallContext();
        };

        expect(fn).to.throw('uuid must present');
      });
    });
  }
});
