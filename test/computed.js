describe('Zero.Computed', function() {
  if (Zero.DEBUG) {
    describe('DEBUG', function() {
      it('should throw error when argument non a function', function() {
        var fn = function() {
          new Zero.Computed();
        };

        expect(fn).to.throw('Computed should be a function');
      });
    });
  }

  it('should be an instance of EventEmitter', function() {
    var computed = new Zero.Computed(Zero.noop);

    expect(computed).to.be.an.instanceof(Zero.EventEmitter);
  });

  it('should have unique uuid', function() {
    var c1 = new Zero.Computed(Zero.noop);
    var c2 = new Zero.Computed(Zero.noop);

    expect(c1.uuid).to.not.be.equal(c2.uuid);
  });

  it('should emit computeFn on first call', function() {
    var a = 0;
    var computeFn = function() {
      a++;
      return 1;
    };
    var computed = new Zero.Computed(computeFn);
    var b = computed.get();

    expect(a).to.be.equal(1);
    expect(b).to.be.equal(1);
  });

  it('should emit `get` event on get', function() {
    var computed = new Zero.Computed(Zero.noop);
    var a = 0;

    computed.on('get', function() {
      a++;
    });

    computed.get();
    computed.get();

    expect(a).to.be.equal(2);
  });

  it('should emit `start` event on compute', function() {
    var computed = new Zero.Computed(Zero.noop);
    var a = 0;

    computed.on('start', function() {
      a++;
    });

    computed.get();

    expect(a).to.be.equal(1);
  });

  it('should emit `end` event after compute', function() {
    var computed = new Zero.Computed(Zero.noop);
    var a = 0;

    computed.on('end', function() {
      a++;
    });

    computed.get();

    expect(a).to.be.equal(1);
  });

  it('should emit `start/end` event when shouldRecompute positive', function() {
    var a = 0
    var computeCnt = 0;
    var computeFn = function() {
      a++;
      return a;
    };
    var computed = new Zero.Computed(computeFn);

    computed.on('end', function() {
      computeCnt++;
    });

    computed.get();
    computed.get();
    computed.shouldRecompute = true;
    computed.get();
    computed.get();

    expect(a).to.be.equal(2);
    expect(computeCnt).to.be.equal(a);
  });

  it('should return cached value', function() {
    var a = 1;
    var b;
    var c;
    var computeCnt = 0;
    var computeFn = function() {
      computeCnt++;
      return 1;
    };
    var computed = new Zero.Computed(computeFn);

    b = computed.get();
    computed.shouldRecompute = true;
    c = computed.get();

    expect(a).to.be.equal(1);
    expect(b).to.be.equal(a);
    expect(c).to.be.equal(a);
    expect(computeCnt).to.be.equal(2);
  });

  it('should run compute function in passed context', function() {
    var ctx1 = {
      a: 0
    };
    var b1;
    var ctx2 = {
      a: 1
    };
    var b2;
    var computeFn = function() {
      this.a++;
      return this.a;
    };
    var computed = new Zero.Computed(computeFn);

    b1 = computed.get(ctx1);
    computed.shouldRecompute = true;
    b2 = computed.get(ctx2);

    expect(ctx1.a).to.be.equal(1);
    expect(b1).to.be.equal(ctx1.a);
    expect(ctx2.a).to.be.equal(2);
    expect(b2).to.be.equal(ctx2.a);
  });

  it('should emit `change` event when computed value changed #1', function() {
    var computeFn = function() {
      return 1;
    };
    var computed = new Zero.Computed(computeFn);
    var a = 0;

    computed.on('change', function() {
      a++;
    });

    computed.get();
    computed.shouldRecompute = true;
    computed.get();

    expect(a).to.be.equal(1);
  });

  it('should emit `change` event when computed value changed #2', function() {
    var a = 0;
    var b;
    var c;
    var changeCnt = 0;
    var computeFn = function() {
      a++;
      return a;
    };
    var computed = new Zero.Computed(computeFn);

    computed.on('change', function() {
      changeCnt++;
    });

    b = computed.get();
    computed.shouldRecompute = true;
    c = computed.get();

    expect(a).to.be.equal(2);
    expect(b).to.be.equal(1);
    expect(c).to.be.equal(2);
    expect(changeCnt).to.be.equal(a);
  });

  it('should emit `change` event between `start` and `end` events', function() {
    var a = 0;
    var b, c, d;
    var computeFn = function() {
      return null;
    };
    var computed = new Zero.Computed(computeFn);

    computed.on('start', function() {
      a++;
      b = a;
    });

    computed.on('change', function() {
      a++;
      c = a;
    });

    computed.on('end', function() {
      a++;
      d = a;
    });

    computed.get();

    expect(a).to.be.equal(3);
    expect(b).to.be.equal(1);
    expect(c).to.be.equal(2);
    expect(d).to.be.equal(3);
  });

  it('should run recompute in last context',  function() {
    var ctx = {
      a: 0
    };
    var computeFn = function() {
      this.a++;
      return this.a;
    };
    var computed = new Zero.Computed(computeFn);

    computed.get(ctx)
    computed.recompute();

    expect(ctx.a).to.be.equal(2);
  });
});
