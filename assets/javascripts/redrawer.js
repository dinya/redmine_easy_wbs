window.ysy = window.ysy || {};
ysy.view = ysy.view || {};
$.extend(ysy.view, {
  onRepaint: [],
  start: function () {
    this.anim();
  },
  redrawMe: function (widget) {
    if (widget._redrawRequested) return;
    widget._redrawRequested = true;
    this.onRepaint.push(widget);
  },
  anim: function () {
    var view = ysy.view;
    if (view.onRepaint.length > 0) {
      var queue = view.onRepaint;
      view.onRepaint = [];
      for (var i = 0; i < queue.length; i++) {
        var renderee = queue[i];
        renderee._render();
        renderee._redrawRequested = false;
      }
    }
    //requestAnimFrame($.proxy(this.anim, this));
    window.requestAnimFrame(view.anim);
  }
});