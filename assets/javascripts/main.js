window.ysy = window.ysy || {};
ysy.main = ysy.main || {};
$.extend(ysy.main, {
  init: function () {
    ysy.util.init();
    if (!window.test_tree) {
      window.test_tree = function () {
        return {}
      };
    } else {
      var exampleData = true;
    }
    if (ysy.settings.easyRedmine && $("#content").children(".easy-content-page").length === 0) {
      $("#easy_wbs").addClass("easy-content-page");
    }
    ysy.styles.init();
    ysy.view.modifMapjs();
    MAPJS.initAll();
    ysy.view.modals.init();
    ysy.view.postMapjs();
    ysy.view.context.init(ysy.mapjs.getModel());
    ysy.view.legends.init();
    ysy.view.toolbar.init();
    ysy.view.start();
    if (!exampleData) {
      ysy.loader.load();
      ysy.saver.init();
    }
  },
  afterLoad: function () {
    ysy.view.legends.draw();
    ysy.view.toolbar.redraw();
  }
});

$(document).ready(ysy.main.init);
