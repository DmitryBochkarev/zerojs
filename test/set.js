describe('Zero.Set', function() {
  if (Zero.DEBUG) {
    describe('DEBUG', function() {
      it('should throw error when elements not array', function() {
        var fn = function() {
          new Zero.Set(true);
        };

        expect(fn).to.throw('Elements must be an array');
      });
    });
  }

  it('should set initial elements', function() {
    var elements = [1, 2, 3];
    var set = new Zero.Set(elements);
    
    expect(set.elements).to.be.equal(elements);
  });

  it('`has` should return true when element present in set', function() {
    var set = new Zero.Set([1, 2, 3]);

    expect(set.has(2)).to.be.true;
  });

  it('`has` should return false when element not present in set', function() {
    var set = new Zero.Set([1, 2, 3]);

    expect(set.has(4)).to.be.false;
  });

  it('`add` should add element', function() {
    var set = new Zero.Set([1, 2, 3]);

    set.add(4);

    expect(set.has(4)).to.be.true;
  });

  it('`remove` should remove element', function() {
    var set = new Zero.Set([1, 2, 3]);

    set.remove(2);

    expect(set.has(2)).to.be.false;
    expect(set.has(1)).to.be.true;
    expect(set.has(3)).to.be.true;
  });

  it('`clear` should remove all elements', function() {
    var set = new Zero.Set([1, 2, 3]);
    
    set.clear();

    expect(set.elements.length).to.be.equal(0);
  });
});
