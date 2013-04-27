#Zerojs

Sometimes you just need simple dependencies detections system.
That is all.

##Example

`cat example/counter.html`

```html
<!doctype html>
<html>
  <head>
    <script type="text/javascript" src="../dist/zero-debug.js"></script>
  </head>
  <body>
    <div id="counter"></div>
    <script type="text/javascript">
      var counterEl = document.getElementById('counter');
      var app = new Zero.Isolation();
      var counter = app.observable(1);
      var view = app.computed(function() {
        return "<p>Counter value:  <strong>" + counter() + "</strong>!</p>";
      });
      var render = app.subscribe(function() {
        var html = view();
        counterEl.innerHTML = html;
      });

      render();

      setInterval(function() {
        counter(counter() + 1);
      }, 1000);
    </script>
  </body>
</html>
```
