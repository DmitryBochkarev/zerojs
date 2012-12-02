describe('Isolation', function() {
  var isolation;

  beforeEach(function() {
    isolation = new Zero.Isolation();
  });

  afterEach(function() {
    isolation.off();
    isolation = null;
  });

  it('should be an instance of EventEmitter', function() {
    expect(isolation).to.be.an.instanceof(Zero.EventEmitter);
  });

  describe('observable', function() {
    it('should be registered as observable', function() {
      var observableInstance = new Zero.Observable('test');

      isolation.registerObservable(observableInstance);

      expect(isolation.observables[observableInstance.uuid]).to.be.equal(observableInstance);
    });

    it('should save value', function() {
      var observable = isolation.observable(1);

      expect(observable()).to.be.equal(1);

      observable(2);

      expect(observable()).to.be.equal(2);
    });

    it('should return context on save', function() {
      var observable = isolation.observable(1);
      var ctx = {
        observable: observable,
        a: 3
      };

      expect(ctx.observable(2).a).to.be.equal(3);
    });
  });
});
