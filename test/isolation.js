describe('Zero.Isolation', function() {
  it('should return computed and observable as functions', function() {
    var isolation = new Zero.Isolation();
    var observable = isolation.observable(0);
    var computed =  isolation.computed(function() {
      return this.observable() + 1;
    });

    expect(observable).to.be.a('function');
    expect(computed).to.be.a('function');
  });

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
    var result;
    var ctx = {
      observableA: isolation.observable(1),
      observableB: isolation.observable(2),
      computedA: isolation.computed(function() {
        return this.observableA();
      }),
      computedB: isolation.computed(function() {
        return this.observableB();
      }),
      subscribeA: isolation.subscribe(function() {
        this.observableB(this.computedA());
      }),
      subscribeB: isolation.subscribe(function() {
        result = this.computedB();
      })
    };

    ctx.subscribeA();
    ctx.subscribeB();
    ctx.observableA(3);

    setTimeout(function() {
      expect(result).to.be.equal(3);
      done();
    }, 200);
  });

  it('gh#3 should support deffered bindings#observable', function(done) {
    var testResult = [];
    var pushTestResult = function(from, data) {
      testResult.push([from, data]);
    };
    var isolation = new Zero.Isolation();
    var userData = isolation.observable({name: 'User1'});

    var renderFast = isolation.subscribe(function() {
      var asyncUserData = isolation.deffer(userData);

      expect(asyncUserData).to.be.a('function');

      setTimeout(outputInfo, 100);
      function outputInfo() {
        pushTestResult('renderFast', asyncUserData().name);
      }
    });

    var renderSlow = isolation.subscribe(function() {
      var asyncUserData = isolation.deffer(userData);

      expect(asyncUserData).to.be.a('function');

      setTimeout(outputInfo, 500);
      function outputInfo() {
        pushTestResult('renderSlow', asyncUserData().name);
      }
    });

    renderFast();
    renderSlow();
    userData({name: 'User2'});

    setTimeout(function() {
      userData({name: 'User3'});
    }, 200);

    setTimeout(function() {
      expect(testResult).to.deep.equal([['renderFast', 'User2'], ['renderFast', 'User3'], ['renderSlow', 'User3']]);
      done();
    }, 700);
  });

  it('gh#3 should support deffered bindings#computed', function(done) {
    var testResult = [];
    var isolation = new Zero.Isolation();
    var user = {
      name: isolation.observable('user1'),
      upperName: isolation.computed(function() {
        return this.name().toUpperCase();
      })
    };

    var output = isolation.subscribe(function() {
      var upperName = isolation.deffer(user.upperName, user);
      var upperName2 = isolation.deffer(user.upperName).bind(user);

      setTimeout(outputInfo, 100);
      function outputInfo() {
        testResult.push(upperName());
        testResult.push(upperName2());
      }
    });

    output();
    user.name('user2');

    setTimeout(function() {
      user.name('user3');
    }, 300);

    setTimeout(function() {
      expect(testResult).to.deep.equal(['USER2', 'USER2', 'USER3', 'USER3']);
      done();
    }, 700);
  });
});
