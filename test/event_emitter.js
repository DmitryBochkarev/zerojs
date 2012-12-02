describe('EventEmitter', function() {
  var eventEmitter;

  beforeEach(function() {
    eventEmitter = new Zero.EventEmitter();
  });

  afterEach(function() {
    eventEmitter.off();
    eventEmitter = null;
  });

  it('eventEmitter should be an instance of Zero.EventEmitter', function() {
    expect(eventEmitter).to.be.an.instanceof(Zero.EventEmitter);
  });

  it('should subscribe to event', function() {
    var handler = function() {
      
    };

    eventEmitter.on('test', handler);

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(1);
    expect(eventEmitter._handlers['test'][0]).to.be.an.instanceof(Zero.EventHandler);
    expect(eventEmitter._handlers['test'][0].fn).to.be.equal(handler);
  });

  it('should unsubscribe handler', function() {
    var handler = function() {};

    eventEmitter.on('test', handler);
    eventEmitter.off('test', handler);

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(0);
  });

  it('should unsubscribe once handler', function() {
    var handler = function() {};

    eventEmitter.once('test', handler);
    eventEmitter.emit('test');

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(0);
  });

  it('should unsubscribe only handler', function() {
    var handler1 = function() {};
    var handler2 = function() {};

    eventEmitter.on('test', handler1);
    eventEmitter.on('test', handler2);
    eventEmitter.off('test', handler1);

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(1);
    expect(eventEmitter._handlers['test'][0].fn).to.be.equal(handler2);
  });

  it('should unsubscribe all handlers from event', function() {
    var handler1 = function() {};
    var handler2 = function() {};

    eventEmitter.on('test', handler1);
    eventEmitter.on('test', handler2);
    eventEmitter.off('test');

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(0);
  });

  it('should unsubscribe all handlers', function() {
    var handler1 = function() {};
    var handler2 = function() {};

    eventEmitter.on('test', handler1);
    eventEmitter.on('test', handler2);
    eventEmitter.off();

    expect(eventEmitter._handlers['test']).to.not.be.exists;
  });

  it('should emit events', function() {
    var once = 0;
    var twice = 0;

    function twiceHandler() {
      twice++;
    };

    eventEmitter.on('add', twiceHandler);
    eventEmitter.once('add', function() {
      once++;
    });
    
    eventEmitter.emit('add');
    eventEmitter.emit('add');

    eventEmitter.off('add', twiceHandler);

    eventEmitter.emit('add');
    eventEmitter.emit('add');
    eventEmitter.emit('add');

    expect(once).to.be.equal(1);
    expect(twice).to.be.equal(2);
  });

  it('should pass arguments to handler', function() {
    var resA = 0;
    var resB = 0;
    var add = function(a, b) {
      resA += a;

      if (b) {
        resB += b;
      }
    };

    eventEmitter.on('add', add);

    eventEmitter.emit('add', 1);
    eventEmitter.emit('add', 3, 5);

    expect(resA).to.be.equal(4);
    expect(resB).to.be.equal(5);
  });
});
