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
    }, 100);
  });
});
