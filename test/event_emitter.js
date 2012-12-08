describe('Zero.EventEmitter', function() {
  var eventEmitter;

  beforeEach(function() {
    eventEmitter = new Zero.EventEmitter();
  });

  afterEach(function() {
    eventEmitter.off();
    eventEmitter = null;
  });

  if (Zero.DEBUG) {
    describe('DEBUG', function() {
      it('`on` should throw error when event name not a string', function() {
        var fn = function() {
          eventEmitter.on();
        };

        expect(fn).to.throw('Event name must be a string');
      });

      it('`on` should throw error when event handler not a function or EventHandler', function() {
        var fn = function() {
          eventEmitter.on('test', true);
        };

        expect(fn).to.throw('Event handler must be a function or instance of EventHandler');
      });

      it('`on` should not throw error when arguments correct', function() {
        var fn = function() {
          eventEmitter.on('test', Zero.noop);
        };

        expect(fn).to.not.throw();
      });

      it('`once` should throw error when event name not a string', function() {
        var fn = function() {
          eventEmitter.once();
        };

        expect(fn).to.throw('Event name must be a string');
      });

      it('`once` should throw error when event handler not a function or EventHandler', function() {
        var fn = function() {
          eventEmitter.once('test', true);
        };

        expect(fn).to.throw('Event handler must be a function or instance of EventHandler');
      });

      it('`once` should not throw error when arguments correct', function() {
        var fn = function() {
          eventEmitter.once('test', Zero.noop);
        };

        expect(fn).to.not.throw();
      });

      it('`off` should throw error when event name not a string', function() {
        var fn = function() {
          eventEmitter.off(true);
        };

        expect(fn).to.throw('Event name must be a string');
      });

      it('`off` should throw error when event handler not a function or EventHandler', function() {
        var fn = function() {
          eventEmitter.off('test', true);
        };

        expect(fn).to.throw('Event handler must be a function or instance of EventHandler');
      });

      it('`off` should not throw error when arguments correct', function() {
        var fn = function() {
          eventEmitter.off('test', Zero.noop);
        };

        expect(fn).to.not.throw();
      });

      it('`emit` should throw error when event name not a string', function() {
        var fn = function() {
          eventEmitter.emit(true);
        };

        expect(fn).to.throw('Event name must be a string');
      });
    });
  }

  it('should be an instance of Zero.EventEmitter', function() {
    expect(eventEmitter).to.be.an.instanceof(Zero.EventEmitter);
  });

  it('should subscribe to event', function() {
    var handler = Zero.noop;

    eventEmitter.on('test', handler);

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(1);
    expect(eventEmitter._handlers['test'][0]).to.be.an.instanceof(Zero.EventHandler);
    expect(eventEmitter._handlers['test'][0].fn).to.be.equal(handler);
  });

  it('should unsubscribe handler', function() {
    var handler = Zero.noop;

    eventEmitter.on('test', handler);
    eventEmitter.off('test', handler);

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(0);
  });

  it('should unsubscribe once handler', function() {
    var handler = Zero.noop;

    eventEmitter.once('test', handler);
    eventEmitter.emit('test');

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(0);
  });

  it('should unsubscribe only handler', function() {
    var handler1 = Zero.noop;
    var handler2 = function(){};

    eventEmitter.on('test', handler1);
    eventEmitter.on('test', handler2);
    eventEmitter.off('test', handler1);

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(1);
    expect(eventEmitter._handlers['test'][0].fn).to.be.equal(handler2);
  });

  it('should unsubscribe all handlers from event', function() {
    var handler1 = Zero.noop;
    var handler2 = function(){};

    eventEmitter.on('test', handler1);
    eventEmitter.on('test', handler2);
    eventEmitter.off('test');

    expect(eventEmitter._handlers['test']).to.be.exists;
    expect(eventEmitter._handlers['test'].length).to.be.equal(0);
  });

  it('should unsubscribe all handlers', function() {
    var handler1 = Zero.noop;
    var handler2 = function(){};

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

  it('should run handler in instance context', function() {
    eventEmitter.on('test', function() {
      expect(this).to.be.equal(eventEmitter);
    });

    eventEmitter.emit('test');
  });
});
