window.ysy = window.ysy || {};
ysy.view = ysy.view || {};
ysy.view.legends = ysy.view.legends || {};
$.extend(ysy.view.legends, {
  opened: true,
  init: function () {
    var $container = $("#wbs_menu");
    this.$element = $container.find("#wbs_legend");
    //this.$element.css({left: 5, top: $container.outerHeight() + 4});
    this.$element.on("click", ".wbs-legend-item-cont", function () {
      ysy.util.showUpgradeModal("filtering");
    });
    $(window).on('resize', $.proxy(this.resize, this));
  },
  toggle: function () {
    this.opened = !this.opened;
    ysy.view.redrawMe(this);
  },
  getItemBuilder: function (type) {
    switch (type) {
      case "assignee":
        return function (item, i) {
          return $("<div data-item_id='" + item.id + "' class='wbs-legend-item-cont'>\
          <div class='wbs-legend-color-box" + ysy.filter.cssByBannedValue(item.id) + ysy.styles.addSchemeClass(type, item.id) + "'></div>\
          " + (item.avatar ? $(item.avatar).html() : "") + "\
          " + item.name + "\
          </div>");
        };
      case "progress":
        return function (item, i) {
          return $("<div data-item_id='" + item + "' class='wbs-legend-item-cont'>\
          <div class='wbs-legend-color-box" + ysy.filter.cssByBannedValue(item) + ysy.styles.addSchemeClass(type, item) + "'></div>\
          " + item + " %\
          </div>");
        };
      default:
        return function (item, i) {
          return $("<div data-item_id='" + item.id + "' class='wbs-legend-item-cont'>\
          <div class='wbs-legend-color-box" + ysy.filter.cssByBannedValue(item.id) + ysy.styles.addSchemeClass(type, item.id) + "'></div>\
          " + item.name + "\
          </div>");
        }

    }
  },
  projectBuilder: function () {
    return $("<div data-item_id='project' class='wbs-legend-item-cont'>\
          <div class='wbs-legend-color-box wbs-scheme-project " + ysy.filter.cssByBannedValue("project") + "'></div>\
          " + ysy.settings.labels.types.project + "\
          </div>");
  },
  draw: function () {
    ysy.view.redrawMe(this);
  },
  _render: function () {
    if (!this.opened) {
      this.$element.hide();
      return;
    }
    this.resize();
    var element = this.$element.empty().show();
    var setting = ysy.styles.setting;
    var itemBuilder, itemElement, array;
    if (setting === "tracker") {
      array = this.filterUsed("tracker_id", ysy.data.trackers);
    } else if (setting === "assignee") {
      array = this.filterUsed("assigned_to_id", ysy.data.users);
    } else if (setting === "priority") {
      array = this.filterUsed("priority_id", ysy.data.priorities);
    } else if (setting === "status") {
      array = this.filterUsed("status_id", ysy.data.statuses);
    } else if (setting === "milestone") {
      array = this.filterUsed("fixed_version_id", ysy.data.milestones);
    } else if (setting === "progress") {
      array = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    } else {
      array = [];
    }
    itemBuilder = this.getItemBuilder(setting) || _.noop;
    element.append("<h3>" + ysy.settings.labels.legend[setting + "_plural"] + "</h3>");
    element.append(this.projectBuilder());
    for (var i = 0; i < array.length; i++) {
      itemElement = itemBuilder(array[i], i);
      element.append(itemElement);
    }
    var $hotkeyLink = $("<div class='hotkey_link'><a href='javascript:void(0)'>Hotkeys</a></div>").attr("id", "hotkey_link");
    $hotkeyLink.click(function () {
      var modal = ysy.util.getModal("info-modal", "90%");
      modal.html($("#wbs_hotkeys").html());
      showModal("info-modal");
      modal.dialog({
        buttons: [
          {
            class: "button-2 button",
            text: ysy.settings.labels.buttons.close,
            click: function () {
              modal.dialog("close")
            }
          }
        ]
      });
    });
    element.append($hotkeyLink);
  },
  filterUsed: function (key, array) {
    var values = {};
    this.recursiveUsed(ysy.mapjs.idea, key, values);
    var filtered = [];
    if (values[0]) {
      filtered.push({id: 0, name: "---"});
    }
    for (var i = 0; i < array.length; i++) {
      if (values[array[i].id]) {
        filtered.push(array[i]);
      }
    }
    return filtered;
  },
  recursiveUsed: function (idea, key, values) {
    var value = ysy.mapModel.getData(idea)[key];
    if (!idea.attr.isProject) values[value || 0] = true;
    var ideaIdeas = idea.ideas;
    for (var rank in ideaIdeas) {
      if (!ideaIdeas.hasOwnProperty(rank)) continue;
      var child = ideaIdeas[rank];
      this.recursiveUsed(child, key, values);
    }
  },
  resize: function () {
    if (!this.opened) return;
    var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    var offset = this.$element.offset().top;
    var scroll = $(document).scrollTop();
    this.$element.css("max-height", (height + scroll - offset - 25) + "px");
  }
});