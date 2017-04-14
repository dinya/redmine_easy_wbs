window.ysy = window.ysy || {};
ysy.styles = ysy.styles || {};
$.extend(ysy.styles, {
  tracker: {
    issueKey: "tracker_id"
  },
  assignee: {
    issueKey: "assigned_to_id"
  },
  status: {
    issueKey: "status_id"
  },
  priority: {
    issueKey: "priority_id"
  },
  progress: {
    issueKey: "done_ratio"
  },
  milestone: {
    issueKey: "fixed_version_id"
  },
  init: function () {
    this.initProgress();
    this.setColor("tracker");
    $("#wbs_color_select")
        .attr("title", ysy.settings.labels.free.headerNotAvailable)
        .on("click", function () {
          ysy.util.showUpgradeModal("coloring");
    });
  },
  initAttribute: function (type, list) {
    var store = this[type];
    store.count = 1;
    store.colors = {};
    for (var i = 0; i < list.length; i++) {
      store.colors[list[i].id] = store.count++;
      if (this.count > 37) this.count = 0;
    }
  },
  initProgress: function () {
    var colors = {};
    for (var i = 0; i < 11; i++) {
      colors[i * 10] = i + 1;
    }
    this.progress.colors = colors;
  },
  //colorSequence: function (n) {
  //  var sextet = Math.floor(n / 6) + 1;
  //  return Color().hsl((n * 0.618033988749895) % 1 * 360, 100, 40 + 20 * (sextet % 3)).rgbString();
  //},
  setColor: function (setting) {
    var cssPrefix = "scheme-by-";
    $("#container, #wbs_legend").removeClass(cssPrefix + this.setting).addClass(cssPrefix + setting);
    this.setting = setting;
    ysy.filter.reset();
  },
  cssClasses: function (node) {
    var data = ysy.mapModel.getData(node);
    if (node.attr && node.attr.isProject) return " wbs-scheme-project";
    return ""
        + this.addSchemeClassFromData("tracker", data)
        + this.addSchemeClassFromData("status", data)
        + this.addSchemeClassFromData("assignee", data)
        + this.addSchemeClassFromData("progress", data)
        + this.addSchemeClassFromData("milestone", data)
        + this.addSchemeClassFromData("priority", data);
  },
  addSchemeClassFromData: function (key, data) {
    var store = this[key];
    var id = data[store.issueKey];
    return this.addSchemeClass(key, id);
  },
  addSchemeClass: function (key, id) {
    var store = this[key];
    if (key === "progress") {
      id = Math.round(id / 10.0) * 10.0;
    }
    if (store.colors[id] === undefined) return "";
    return " scheme-" + key + "-" + store.colors[id];
  }
});
