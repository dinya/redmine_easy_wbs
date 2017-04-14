window.ysy = window.ysy || {};
ysy.view = ysy.view || {};
ysy.view.context = ysy.view.context || {};
$.extend(ysy.view.context, {
  $element: null,
  init: function (mapModel) {
    var $element = $("<div id='context-menu'></div>").appendTo('body').hide();
    this.$element = $element;
    mapModel.addEventListener('mapMoveRequested mapScaleChanged nodeSelectionChanged nodeEditRequested mapViewResetRequested', this.hide);
    mapModel.addEventListener('contextMenuRequested', this.show);
    $element.on('contextmenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  },
  hide: function () {
    ysy.view.context.$element.hide();
  },
  show: function (nodeId, x, y) {
    var contextClass = ysy.view.context;
    var hide = ysy.view.context.hide;
    var $element = contextClass.$element;
    var idea = ysy.mapjs.idea.findSubIdeaById(nodeId);
    var rendered = Mustache.render(contextClass.template, contextClass.getStructure(idea));
    $element.html(rendered);
    contextClass.bindEvents(idea, $element);
    $element.show().focus();
    if (x === 'keyboard') {
      var offset = $("#node_" + nodeId).offset();
      $element.offset({left: offset.left + 30, top: offset.top + 20});
    } else {
      $element.css('left', x).css('top', y - 10);
    }
    var $window = $(window);
    if ($element.offset().top - $window.scrollTop() + $element.outerHeight() > $window.height() - 20) {
      $element.css('top', $window.height() - 20 + $window.scrollTop() - $element.outerHeight());
    }

    $(document).off('click', hide).on('touch keydown', hide);
    $element.on('mouseenter', function () {
      $(document).off('click', hide);
    });
    $element.on('mouseout', function () {
      $(document).on('click', hide);
    });
    $(document).on('touch keydown', hide);
  },
  bindEvents: function (node, $element) {
    var mapModel = ysy.mapjs.getModel();
    $element.mapToolbarWidget(mapModel);
    $element.find(".wbs-upgrade").on('click', function () {
      ysy.util.showUpgradeModal("context_menu");
    });
  },
  template: '\
  <ul>\
    {{#.}}\
    {{^skip}}\
      <li class="{{#hasSubmenu}}folder{{/hasSubmenu}}">\
        <a href="javascript:void(0)" class="{{#hasSubmenu}}submenu{{/hasSubmenu}} {{className}}">{{name}}</a>\
        {{#hasSubmenu}}\
          <ul>\
            {{#key}}\
              {{#submenu}}\
                <li><a href="javascript:void(0)" class="wbs-data-value-changer {{className}} wbs-context-submenu-item {{#previous}}icon-checked disabled{{/previous}}" data-key="{{key}}" data-value="{{value}}">{{name}}</a></li>\
              {{/submenu}}\
            {{/key}}\
            {{^key}}\
              {{#submenu}}\
                <li><a href="javascript:void(0)" class="{{className}} wbs-context-submenu-item" >{{name}}</a></li>\
              {{/submenu}}\
            {{/key}}\
          </ul>\
        {{/hasSubmenu}}\
      </li>\
    {{/skip}}\
    {{/.}}\
  </ul>',
  getStructure: function (node) {
    var data = ysy.mapModel.getData(node);
    var isProject = node.attr && node.attr.isProject;
    var isCollapsed = node.attr && node.attr.collapsed;
    var trackers, priorities, statuses, assignees, doneRatio;
    if (!isProject) {
      var entityList = ysy.data.trackers;
      trackers = [];
      for (var i = 0; i < entityList.length; i++) {
        var entity = entityList[i];
        trackers.push({name: entity.name, value: entity.id, previous: data.tracker_id === entity.id});
      }
      entityList = ysy.data.priorities;
      priorities = [];
      for (i = 0; i < entityList.length; i++) {
        entity = entityList[i];
        priorities.push({name: entity.name, value: entity.id, previous: data.priority_id === entity.id});
      }
      entityList = ysy.data.statuses;
      statuses = [];
      for (i = 0; i < entityList.length; i++) {
        entity = entityList[i];
        statuses.push({name: entity.name, value: entity.id, previous: data.status_id === entity.id});
      }
      entityList = ysy.data.users;
      assignees = [{name: "<< nobody >>", value: null, previous: !data.assigned_to_id}];
      for (i = 0; i < entityList.length; i++) {
        entity = entityList[i];
        assignees.push({name: entity.name, value: entity.id, previous: data.assigned_to_id === entity.id});
      }
      doneRatio = [];
      var dataDoneRatio = data.done_ratio || 0;
      for (i = 0; i <= 100; i += 10) {
        doneRatio.push({name: i + " %", value: i, previous: dataDoneRatio === i})
      }
    }
    var labels = ysy.settings.labels;
    var ctxLabels = labels.context;
    return [
      {
        name: isCollapsed ? ctxLabels.expand : ctxLabels.collapse,
        className: 'icon-folder toggleCollapse'
      }, {
        name: ctxLabels.goto + " " + (isProject ? labels.types.project : labels.types.issue),
        className: 'icon-move followURL'
      }, {
        name: ctxLabels.rename,
        className: 'icon-edit editNode'
      }, {
        name: ctxLabels.editData,
        className: 'icon-edit editNodeData',
        skip: isProject
      }, {
        name: ctxLabels.changeProperties,
        hasSubmenu: true,
        submenu: [
          {
            name: ctxLabels.tracker,
            className: 'icon-edit wbs-upgrade'
          }, {
            name: ctxLabels.priority,
            className: 'icon-edit wbs-upgrade'
          }, {
            name: ctxLabels.status,
            className: 'icon-edit wbs-upgrade'
          }, {
            name: ctxLabels.assignee,
            className: 'icon-edit wbs-upgrade'
          }, {
            name: ctxLabels.doneRatio,
            className: 'icon-edit wbs-upgrade'
          }
        ],
        skip: isProject
      }, {
        name: ctxLabels.add,
        className: 'icon-add',
        hasSubmenu: true,
        submenu: [{
          name: ctxLabels.addChild,
          className: 'icon-add addSubIdea'
        }, {
          name: ctxLabels.addSibling,
          className: 'icon-add addSiblingIdea'
        }, {
          name: ctxLabels.addParent,
          className: 'icon-add insertIntermediate'
        }
        ]
      }, {
        name: ctxLabels.remove,
        className: 'icon-del removeSubIdea',
        skip: isProject
      }
    ]
  }

});