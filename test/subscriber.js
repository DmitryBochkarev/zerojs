describe('Zero.Subscriber', function() {
  it('should be an instance of EventEmitter', function() {
    var subscriber = new Zero.Subscriber(Zero.noop);

    expect(subscriber).to.be.an.instanceof(Zero.EventEmitter);
  });

  it('should have unique uuid', function() {
    var subscriber1 = new Zero.Subscriber(Zero.noop);
    var subscriber2 = new Zero.Subscriber(Zero.noop);

    expect(subscriber1.uuid).to.not.be.equal(subscriber2.uuid);
  });

  it('should emit `start` event on run', function() {
    var a = 0;
    var subscriber = new Zero.Subscriber(Zero.noop);
    
    subscriber.on('start', function() {
      a++;
    });

    subscriber.run();
    subscriber.run();

    expect(a).to.be.equal(2);
  });

  it('should emit `end` event on run', function() {
    var a = 0;
    var subscriber = new Zero.Subscriber(Zero.noop);
    
    subscriber.on('end', function() {
      a++;
    });

    subscriber.run();
    subscriber.run();

    expect(a).to.be.equal(2);
  });

  it('should run subscribe function in passed context', function() {
    var ctx = {
      a: 0
    };
    var subscribeFn = function() {
      this.a++;
    };
    var subscriber = new Zero.Subscriber(subscribeFn);
    
    subscriber.run(ctx);
    subscriber.run(ctx);

    expect(ctx.a).to.be.equal(2);
  });

  it('should should return passed context after run', function() {
    var ctx = {
      a: 0
    };
    var ret;
    var subscribeFn = function() {
    };
    var subscriber = new Zero.Subscriber(subscribeFn);
    
    ret = subscriber.run(ctx);

    expect(ret).to.be.equal(ctx);
  });
});
