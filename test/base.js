describe('Helpers', function() {
  describe('noop', function() {
    it('should return passing value', function() {
      var a = 1;
      var b = Zero.noop(a);

      expect(b).to.be.equal(a);
    });
  });

  describe('uuid', function() {
    it('present', function() {
      expect(Zero.uuid).to.not.be.undefined;
    });
      
    it('generate unique uuid every time', function() {
      var a = Zero.uuid();
      var b = Zero.uuid();

      expect(a).to.not.be.undefined;
      expect(b).to.not.be.undefined;
      expect(a).to.not.equal(b);
    });
  });

  describe('deferred', function() {
    it('run only once', function(done) {
      var i = 0;

      var deferred = Zero.deferred(1, function() {
        i++;
      });

      deferred();
      deferred();
      deferred();

      setTimeout(function() {
        expect(i).to.be.equal(1);
        done();
      }, 1);
    });

    it('should run in called context', function(done) {
      var deferred = Zero.deferred(1, function() {
        this.i++;
      });
      var ctx = {
        i: 0,
        deferred: deferred
      };
      
      ctx.deferred();

      setTimeout(function() {
        expect(ctx.i).to.be.equal(1);
        done();
      }, 1);
    });
  });
});


