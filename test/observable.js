describe('Zero.Observable', function() {
  var observable;

  beforeEach(function() {
    observable = new Zero.Observable();
  });

  afterEach(function() {
    observable = null;
  });
  
  it('should be an instance of EventEmitter', function() {
    expect(observable).to.be.an.instanceof(Zero.EventEmitter);
  });

  it('should have unique id', function() {
    var observable2 = new Zero.Observable();

    expect(observable.id).to.not.be.equal(observable2.id);
  });

  it('should save value', function() {
    var value = 1;

    observable.set(value);

    expect(observable.get()).to.be.equal(value);
  });

  it('should emit event on set', function() {
    var a = 0;

    observable.on('set', function() {
      a++;
    });

    observable.set(1);
    observable.set(1);

    expect(a).to.be.equal(2);
  });

  it('should emit event on change', function() {
    var a = 0;

    observable.on('change', function() {
      a++;
    });

    observable.set(1);
    observable.set(1);

    expect(a).to.be.equal(1);
  });
  
  it('should emit event on get', function() {
    var a = 0;

    observable.on('get', function() {
      a++;
    });

    observable.get();
    observable.get();

    expect(a).to.be.equal(2);
  });
});
