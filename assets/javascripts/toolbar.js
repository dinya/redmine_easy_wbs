window.ysy = window.ysy || {};
ysy.view = ysy.view || {};
ysy.view.toolbar = ysy.view.toolbar || {};
$.extend(ysy.view.toolbar, {
  $menu: null,
  children: {},
  init: function () {
    this.$menu = $("#wbs_menu");
    this.children["toggleOneSide"] = ysy.view.oneSideButton.init(this.$menu);
    this.children["sticky"] = ysy.view.stickyMenu.init(this.$menu);
    this.children["legend"] = ysy.view.legendButton.init(this.$menu);
  },
  _render: function () {
    for (var key in this.children) {
      if (!this.children.hasOwnProperty(key)) continue;
      this.children[key]._render();
    }
  },
  redraw: function (item) {
    if (!item) {
      return ysy.view.redrawMe(this);
    }
    if (this.children[item]) {
      var child = this.children[item];
      ysy.view.redrawMe(child);
    }
  }
});
ysy.view.oneSideButton = {
  $element: null,
  init: function ($parent) {
    this.$element = $parent.children(".toggleOneSide");
    return this;
  },
  _render: function () {
    var isActive = ysy.mapjs.idea && ysy.mapjs.idea.oneSideOn;
    if (isActive === undefined) isActive = false;
    this.$element.toggleClass("active", isActive);
    this.$element.find("a").toggleClass("active", isActive);
  }
};
ysy.view.legendButton = {
  $element: null,
  model: null,
  init: function ($parent) {
    this.model = ysy.view.legends;
    this.$element = $parent.children(".legend-toggler");
    this.$element.click($.proxy(function () {
      this.model.toggle();
      ysy.view.redrawMe(this);
    }, this));
    return this;
  },
  _render: function () {
    var isActive = ysy.view.legends.opened;
    this.$element.toggleClass("active", isActive);
    this.$element.find("a").toggleClass("active", isActive);
  }
};
ysy.view.stickyMenu = {
  $element: null,
  isFixed: false,
  init: function ($element) {
    this.$element = $element;
    this.$cont = $element.parent();
    this.$placeholder = $("<div id='wbs_menu_placeholder' style='height:0'></div>");
    this.$cont.prepend(this.$placeholder);
    this.$document = $(document);
    this.offset = 0;
    if (ysy.settings.easyRedmine) {
      this.offset += $("#top-menu").outerHeight();
    }
    $(document).on("scroll", $.proxy(function () {
      ysy.view.redrawMe(this);
    }, this));
    return this;
  },
  _render: function () {
    //ysy.log.debug("stickyMenu rendered");
    var top = this.$document.scrollTop() + this.offset - this.$cont.offset().top;
    if (top > 0) {
      if (!this.isFixed) {
        this.$element.css({position: "fixed", top: this.offset + "px", width: this.$cont.width() + "px"});
        this.$placeholder.height(this.$element.height());
        this.isFixed = true;
      }
    } else {
      if (this.isFixed) {
        this.$element.css({position: "relative", top: "0", width: ""});
        this.$placeholder.height(0);
        this.isFixed = false;
      }
    }
    //var top = Math.max(this.$document.scrollTop() + this.offset - this.$cont.offset().top, 0);
    //this.$element.css({transform: "translate(0," + Math.round(top) + "px)"});
  }
};