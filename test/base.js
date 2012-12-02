describe('Zero', function() {
  it('Should exist', function() {
    expect(Zero).to.not.be.undefined;
  });

  it('Should have EventHandler', function() {
    expect(Zero.EventHandler).to.not.be.undefined;
  });

  it('Should have EventEmitter', function() {
    expect(Zero.EventEmitter).to.not.be.undefined;
  });

  it('Should have Isolation', function() {
    expect(Zero.Isolation).to.not.be.undefined;
  });
});

describe('Helpers', function() {
  describe('uuid', function() {
    it('present', function() {
      expect(Zero.uuid).to.not.be.undefined;
    });
      
    it('generate unique uuid every time', function() {
      var a = Zero.uuid();
      var b = Zero.uuid();

      expect(a).to.not.be.null;
      expect(b).to.not.be.null;
      expect(a).to.not.equal(b);
    });
  });

  describe('deferred', function() {
    it('run only once', function(done) {
      var i = 0;

      var check = function() {
        setTimeout(function() {
          expect(i).to.be.equal(1);
          done();
        }, 100);
      };

      var deferred = Zero.deferred(1, function() {
        i++;
      });

      deferred();
      deferred();
      deferred();
      check();
    });
  });
});


