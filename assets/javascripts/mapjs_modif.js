window.ysy = window.ysy || {};
ysy.view = ysy.view || {};
$.extend(ysy.view, {
  modifMapjs: function () {
    jQuery.fn.updateNodeContent = function (nodeContent, resourceTranslator) {
      'use strict';
      var MAX_URL_LENGTH = 25,
          self = jQuery(this),
          textSpan = function () {
            var span = self.find('[data-mapjs-role=title]');
            if (span.length === 0) {
              span = jQuery('<span>').attr('data-mapjs-role', 'title').appendTo(self);
            }
            return span;
          },
      //applyLinkUrl = function (title) {
      //  var url = MAPJS.URLHelper.getLink(title),
      //      element = self.find('a.mapjs-hyperlink');
      //  if (!url) {
      //    element.hide();
      //    return;
      //  }
      //  if (element.length === 0) {
      //    element = jQuery('<a target="_blank" class="mapjs-hyperlink"></a>').appendTo(self);
      //  }
      //  element.attr('href', url).show();
      //},
          updateText = function (title) {
            var text = MAPJS.URLHelper.stripLink(title) ||
                    (title.length < MAX_URL_LENGTH ? title : (title.substring(0, MAX_URL_LENGTH) + '...')),
                nodeTextPadding = MAPJS.DOMRender.nodeTextPadding || 11,
                element = textSpan(),
                domElement = element[0],
                height;

            element.text(text.trim());
            self.data('title', title);
            element.css({'max-width': '', 'min-width': ''});
            if ((domElement.scrollWidth - nodeTextPadding) > domElement.offsetWidth) {
              element.css('max-width', domElement.scrollWidth + 'px');
            } else {
              height = domElement.offsetHeight;
              element.css('min-width', element.css('max-width'));
              if (domElement.offsetHeight === height) {
                element.css('min-width', '');
              }
            }
          },
          foregroundClass = function (backgroundColor) {
            /*jslint newcap:true*/
            var luminosity = Color(backgroundColor).mix(Color('#EEEEEE')).luminosity();
            if (luminosity < 0.5) {
              return 'mapjs-node-dark';
            } else if (luminosity < 0.9) {
              return 'mapjs-node-light';
            }
            return 'mapjs-node-white';
          },
      //setColors = function () {
      //  var fromStyle = nodeContent.attr && nodeContent.attr.style && nodeContent.attr.style.background;
      //  if (fromStyle === 'false' || fromStyle === 'transparent') {
      //    fromStyle = false;
      //  }
      //  self.removeClass('mapjs-node-dark mapjs-node-white mapjs-node-light');
      //  if (fromStyle) {
      //    self.css('background-color', fromStyle);
      //    self.addClass(foregroundClass(fromStyle));
      //  } else {
      //    self.css('background-color', '');
      //  }
      //  self.addClass(ysy.colors.background.cssClasses(nodeContent));
      //},
          setStyles = function () {
            self[0].className = self[0].className.replace(/ scheme-\S+/g, '') + ysy.styles.cssClasses(nodeContent);
          },
          setExclamation = function () {
            var element = self.find('a.mapjs-exclamation');
            var data = ysy.mapModel.getData(nodeContent);
            if (data.tracker_id || nodeContent.attr.isProject) {
              element.hide();
              return;
            }
            if (element.length === 0) {
              element = jQuery('<a href="javascript:void(0)" title="Issue has to be edited before save" class="mapjs-exclamation"></a>').appendTo(self);
            }
            element.show();
          },
          setCollapse = function () {
            self.toggleClass('wbs-node-left', nodeContent.x && nodeContent.x + nodeContent.width < 0);
            self.toggleClass('collapsed', !!(nodeContent.attr && nodeContent.attr.collapsed));
            var element = self.find('.mapjs-collapsor');
            if (element.length === 0) {
              element = jQuery('<div class="mapjs-collapsor"></div>').appendTo(self);
            }
            element.toggle(nodeContent.attr.hasChildren);
            //var visible = nodeContent.ideas && _.size(nodeContent.ideas) > 0;
            //element.toggle(visible);
            var collapsed = !!nodeContent.attr.collapsed;
            element.toggleClass("button-collapsed", collapsed).html(collapsed ? "+" : "-");
          },
          setAvatar = function () {
            var element = self.find('.wbs-node-avatar');
            if (element.length === 0) {
              element = jQuery('<div class="wbs-node-avatar"></div>').appendTo(self);
            }
            var assigneeIndex = _.findIndex(ysy.data.users, {
              id: ysy.mapModel.getData(nodeContent).assigned_to_id
            });
            if (assigneeIndex > -1 && ysy.data.users[assigneeIndex].avatar) {
              element.html($(ysy.data.users[assigneeIndex].avatar).html());
            }
          },
          setTypeClass = function () {
            self.removeClass("wbs-project wbs-issue");
            if (nodeContent.attr.isProject) {
              self.addClass("wbs-project");
            } else {
              self.addClass("wbs-issue");
            }
          };
      self.attr('mapjs-level', nodeContent.level);
      updateText(nodeContent.title);
      //applyLinkUrl(nodeContent.title);
      self.data({
            'x': Math.round(nodeContent.x),
            'y': Math.round(nodeContent.y),
            'width': Math.round(nodeContent.width),
            'height': Math.round(nodeContent.height),
            'nodeId': nodeContent.id
          })
          .addNodeCacheMark(nodeContent);
      //setColors();
      setStyles();
      setTypeClass();
      setExclamation();
      setAvatar();
      //setIcon(nodeContent.attr && nodeContent.attr.icon);
      setCollapse();
      if (nodeContent.attr.force) delete nodeContent.attr.force;  // remove force flag if present
      self.toggleClass(ysy.filter.className, ysy.filter.isBanned(nodeContent));
      return self;
    };

  },
  postMapjs: function () {
    var mapModel = ysy.mapjs.getModel();
    mapModel.addEventListener("followURL", function (idea) {
      var data = ysy.mapModel.getData(idea);
      if (!data.id) return false;
      if (idea.attr.isProject) {
        window.open(ysy.settings.paths.projectPage.replace(":projectID", data.id), '_blank');
      } else {
        window.open(ysy.settings.paths.issuePage.replace(":issueID", data.id), '_blank');
      }
    });
    mapModel.addEventListener("saveSettings", function (idea) {
      ysy.storage.settings.save(idea);
    });
    $("#container").off("click.collapsor").on("click.collapsor", ".mapjs-collapsor", function () {
      mapModel.toggleCollapse();
    });
  }
});
