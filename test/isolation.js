describe('Zero.Isolation', function() {
  it('should resolve computed dependencies', function(done) {
    var isolation = new Zero.Isolation();
    var a = 0;
    var ctx = {
      observable: isolation.observable(0),
      computed: isolation.computed(function() {
        return this.observable() + 1;
      }),
      subscriber: isolation.subscribe(function() {
        a = this.computed();
      })
    };
    
    ctx.subscriber();
    expect(a).to.be.equal(1);
    ctx.observable(1);

    setTimeout(function() {
      expect(a).to.be.equal(2);
      done();
    }, 200);
  });

  it('resolve should be a lazy', function(done) {
    var isolation = new Zero.Isolation();
    var a = 0;
    var b = 0;
    var counter = 0;
    var ctx = {
      observableA: isolation.observable(0),
      observableB: isolation.observable(1),
      computedA: isolation.computed(function() {
        return this.observableA() + this.observableB();
      }),
      computedB: isolation.computed(function() {
        return this.observableA() - this.observableB();
      }),
      subscribe: isolation.subscribe(function() {
        counter++;
        a = this.computedA();
        b = this.computedB();
      })
    };
    
    ctx.subscribe();
    ctx.observableA(1);
    ctx.observableB(4);

    setTimeout(function() {
      expect(a).to.be.equal(5);
      expect(b).to.be.equal(-3);
      expect(counter).to.be.equal(2);
      done();
    }, 200);
  });

  it('should detect changes when resolve', function(done) {
    var isolation = new Zero.Isolation();
    var a = 0;
    var b = 0;
    var counterA = 0;
    var counterB = 0;
    var ctx = {
      observableA: isolation.observable(1),
      observableB: isolation.observable(2),
      computedA: isolation.computed(function() {
        return this.observableA() + 1;
      }),
      computedB: isolation.computed(function() {
        return this.observableB() + 2;
      }),
      subscribeA: isolation.subscribe(function() {
        counterA++;
        a = this.computedA();
        this.observableB(a + 1);
      }),
      subscribeB: isolation.subscribe(function() {
        counterB++;
        b = this.computedB();
      })
    };
    
    ctx.subscribeA();
    ctx.subscribeB();
    ctx.observableA(2);

    setTimeout(function() {
      expect(a).to.be.equal(3);
      expect(b).to.be.equal(5);
      expect(counterA).to.be.equal(2);
      expect(counterB).to.be.equal(2);
      done();
    }, 200);
  });
});
