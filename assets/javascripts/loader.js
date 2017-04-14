window.ysy = window.ysy || {};
ysy.loader = ysy.loader || {};
$.extend(ysy.loader, {
  _mainProjectId: 1,
  firstLoad: true,
  load: function () {
    $.getJSON(ysy.settings.paths.data, $.proxy(this._handleData, this));
  },
  _handleData: function (data) {
    this.sourceData = data;
    this.loadTrackers(data);
    this.loadUsers(data);
    this.loadPriorities(data);
    this.loadStatuses(data);
    this.loadMilestones(data);
    var convertedData = this.convertData(data);
    var enhancedData = ysy.storage.extra.enhanceData(convertedData, convertedData[this._mainProjectId]);
    var rearranged = this.rearrangeData(enhancedData);
    var initedData = MAPJS.content(rearranged);
    var last = ysy.storage.lastState.getSavedIdea();
    if (this.firstLoad && last) {
      this.firstLoad = false;
      return this.openStoredModal(last, initedData);
    }
    this.firstLoad = false;
    var diff = ysy.storage.lastState.compareIdea(initedData, 'structure');
    if (this.prepareLastStateMessages(diff, initedData)) return;
    ysy.mapjs.setIdea(initedData);
  },
  convertData: function (data) {
    var projectsSource = data.easy_wbs_data.projects;
    var issuesSource = data.easy_wbs_data.issues;
    var convertedEntities = [{}];
    var i;
    var lastId = 1;
    var projectMap = {};
    var issueMap = {};
    for (i = 0; i < projectsSource.length; i++) {
      var projectSource = projectsSource[i];
      if (projectSource.id === ysy.settings.projectID) {
        this._mainProjectId = lastId;
      }
      var project = {
        title: projectSource.name,
        id: lastId++,
        parent: this.getParentFromSource(projectSource),
        ideas: {},
        attr: {
          isProject: true,
          style: {
            background: "#000000"
          },
          data: projectSource
        },
        nChild: 0
      };
      convertedEntities.push(project);
      projectMap[projectSource.id] = convertedEntities.length - 1;
    }
    for (i = 0; i < issuesSource.length; i++) {
      var issueSource = issuesSource[i];
      var issue = {
        id: lastId++,
        title: issueSource.subject,
        parent: this.getParentFromSource(issueSource),
        nChild: 0,
        ideas: {},
        attr: {
          data: issueSource,
          style: {}
        }
      };
      convertedEntities.push(issue);
      issueMap[issueSource.id] = convertedEntities.length - 1;
    }
    var parent;
    for (var id = 1; id < convertedEntities.length; id++) {
      if (id === this._mainProjectId) continue;
      issue = convertedEntities[id];
      if (issue.parent.project) {
        parent = projectMap[issue.parent.id];
      } else {
        parent = issueMap[issue.parent.id];
      }
      if (!parent) {
        parent = this.getHigherParent(issue, projectMap, issueMap);
      }
      issue.parent = parent;
    }
    return convertedEntities;
  },
  rearrangeData: function (convertedEntities) {
    var detachedIssues = [];
    var index = 0;
    for (var id = 1; id < convertedEntities.length; id++) {
      if (id === this._mainProjectId) continue;
      issue = convertedEntities[id];
      var parent = convertedEntities[issue.parent];
      var parentIdeas = parent.ideas;
      parent.nChild++;
      if (issue.rank) {
        if (issue._parentTitle !== parent.title) {
          delete issue.rank;
        }
        delete issue._parentTitle;
      }
      if (issue.rank) {
        if (parentIdeas[issue.rank]) {
          detachedIssues.push(parentIdeas[issue.rank])
        }
        parentIdeas[issue.rank] = issue;
        delete issue.rank;
      } else {
        if (parent.id === this._mainProjectId) {
          index = parent.nChild % 2 === 0 ? -parent.nChild / 2 : parent.nChild / 2 + 0.5;
          //console.log("index "+index + " nChild "+parent.nChild);
          if (parentIdeas[index]) {
            detachedIssues.push(issue);
          } else {
            parentIdeas[index] = issue;
          }
        } else {
          if (parentIdeas[parent.nChild]) {
            detachedIssues.push(issue);
          } else {
            parentIdeas[parent.nChild] = issue;
          }
        }
      }
      if (parent.id === this._mainProjectId) {
        var counter = 0;
        index = 0;
        while (detachedIssues.length > 0) {
          counter++;
          index = index > 0 ? index - counter : index + counter;
          if (parentIdeas[index]) continue;
          parentIdeas[index] = detachedIssues.shift();
        }
      } else {
        index = 0;
        while (detachedIssues.length > 0) {
          index++;
          if (parentIdeas[index]) continue;
          parentIdeas[index] = detachedIssues.shift();
        }
      }
    }
    for (id = 1; id < convertedEntities.length; id++) {
      var issue = convertedEntities[id];
      delete issue.parent;
      if (issue.attr.collapsed === undefined) {
        if (id === this._mainProjectId) continue;
        if (issue.nChild) {
          issue.attr.collapsed = true;
        }
        delete issue.nChild;
      }
    }
    return convertedEntities[this._mainProjectId];
  },
  getParentFromSource: function (issue) {
    if (issue.parent_issue_id) return {project: false, id: issue.parent_issue_id};
    if (issue.parent_id) return {project: true, id: issue.parent_id};
    if (issue.project_id) return {project: true, id: issue.project_id};
    return {project: true, id: ysy.settings.projectID};
  },
  getHigherParent: function (node, projectMap) {
    var issue = node.attr.data;
    var parent;
    if (issue.parent_issue_id) {
      parent = projectMap[issue.project_id];
      if (parent) return parent;
    }
    return projectMap[ysy.settings.projectID];
  },
  loadTrackers: function (data) {
    ysy.data.trackers = data.easy_wbs_data.trackers;
    ysy.styles.initAttribute("tracker", ysy.data.trackers);
  },
  loadPriorities: function (data) {
    if (!data) return;
    ysy.data.priorities = data.easy_wbs_data.priorities;
    ysy.styles.initAttribute("priority", ysy.data.priorities);
  },
  loadStatuses: function (data) {
    if (!data) return;
    ysy.data.statuses = data.easy_wbs_data.statuses;
    ysy.styles.initAttribute("status", ysy.data.statuses);
  },
  loadUsers: function (data) {
    if (!data) return;
    ysy.data.users = data.easy_wbs_data.users;
    ysy.styles.initAttribute("assignee", ysy.data.users);
  },
  loadMilestones: function (data) {
    if (!data) return;
    ysy.data.milestones = data.easy_wbs_data.versions;
    ysy.styles.initAttribute("milestone", ysy.data.milestones);
  },
  openLastStateModal: function (messages, serverState) {
    var $target = ysy.util.getModal("form-modal", "50%");
    var template = ysy.settings.templates.lastStateModal;
    //var obj = $.extend({}, ysy.view.getLabel("reloadModal"),{errors:errors});
    var rendered = Mustache.render(template, {differences: messages});
    $target.html(rendered);
    var loadStorageIdea = function () {
      var idea = ysy.storage.lastState.getSavedIdea();
      ysy.mapjs.setIdea(idea);
      $target.dialog("close");
    };
    showModal("form-modal");
    $target.dialog({
          buttons: [
            {
              id: "last_state_modal_yes",
              text: ysy.settings.labels.buttons.button_yes,
              class: "wbs-last-modal-button button-1",
              click: function () {
                $target.dialog("close");
                $(".flash").remove();
                ysy.mapjs.setIdea(serverState);
              }
            },
            {
              id: "last_state_modal_no",
              text: ysy.settings.labels.buttons.button_no,
              class: "wbs-last-modal-button button-2",
              click: loadStorageIdea
            }
          ]
        })
        .parent().find(".ui-dialog-titlebar-close").on('click', loadStorageIdea);
    $("#last_state_modal_yes").focus();
  },
  getDiffMessages: function (oldDiff, newDiff, serverState, moved) {
    if (!moved) {
      var root = true;
      moved = {};
    }
    var messages = [];
    if (!serverState) {
      serverState = oldDiff;
    }

    if (oldDiff.attr && oldDiff.attr.data && newDiff.attr && newDiff.attr.data) {
      var oldDataDiff = oldDiff.attr.data;
      var newDataDiff = newDiff.attr.data;
      var dataKeys = _.intersection(_.keys(oldDataDiff), [
        "subject", "name", "status_id", "priority_id", "assigned_to_id", "done_ratio", "parent_issue_id", "project_id", "parent_id"]);
      var subMessages = [];
      for (var i = 0; i < dataKeys.length; i++) {
        var key = dataKeys[i];
        subMessages.push(key + ": " + oldDataDiff[key] + " => " + newDataDiff[key]);
      }
      if (subMessages.length) {
        messages.push({
          isProject: serverState.attr.isProject,
          name: serverState.title,
          changed: true,
          changes: subMessages.join(", ")
        });
      }
    }
    if (oldDiff.ideas && newDiff.ideas) {
      var oldIdeasDiff = oldDiff.ideas;
      var newIdeasDiff = newDiff.ideas;
      dataKeys = _.keys(oldIdeasDiff);
      var fromId = 0;
      var toId = 0;
      for (i = 0; i < dataKeys.length; i++) {
        var rank = dataKeys[i];
        if (!oldIdeasDiff[rank]) {

          toId = ysy.mapModel.getData(newIdeasDiff[rank]).id || newIdeasDiff[rank].title;
        } else if (!newIdeasDiff[rank]) {
          fromId = ysy.mapModel.getData(oldIdeasDiff[rank]).id || oldIdeasDiff[rank].title;
        } else if (oldIdeasDiff[rank].id !== newIdeasDiff[rank].id) {
          toId = ysy.mapModel.getData(newIdeasDiff[rank]).id || newIdeasDiff[rank].title;
          fromId = ysy.mapModel.getData(oldIdeasDiff[rank]).id || oldIdeasDiff[rank].title;
        } else {
          messages = messages.concat(this.getDiffMessages(oldIdeasDiff[rank], newIdeasDiff[rank], serverState.ideas[rank], moved));
        }
        if (toId) {
          if (moved[toId]) {
            moved[toId].to = serverState;
          } else {
            var child = serverState.ideas[rank];
            moved[toId] = {node: child, to: serverState};
          }
        }
        if (fromId) {
          if (moved[fromId]) {
            moved[fromId].from = serverState;
          } else {
            child = oldIdeasDiff[rank];
            moved[fromId] = {node: child, from: serverState};
          }
        }
      }
    }
    if (root) {
      dataKeys = _.keys(moved);
      for (i = 0; i < dataKeys.length; i++) {
        var id = dataKeys[i];
        var pack = moved[id];
        var message = {isProject: pack.node.attr.isProject, name: pack.node.title};
        if (pack.to) {
          if (pack.from) {
            _.extend(message, {moved: true, from: pack.from.title, to: pack.to.title});
          } else {
            _.extend(message, {present: true, to: pack.to.title});
          }
        } else {
          _.extend(message, {missing: true, from: pack.from.title});
        }
        messages.push(message);
      }
    }
    return messages;
  },
  prepareLastStateMessages: function (diff, initedData) {
    if (!diff) return false;
    var messagePacks = this.getDiffMessages(diff.oldDiff, diff.newDiff, initedData);
    if (messagePacks.length === 0) return false;
    var template = ysy.settings.templates.reloadErrors;
    var errorsHtml = Mustache.render(template, messagePacks);
    ysy.util.showMessage(errorsHtml, "warning");
    this.openLastStateModal(errorsHtml, initedData);
    return true;
  },
  openStoredModal: function (last, serverState) {
    var $target = ysy.util.getModal("form-modal", "50%");
    //var template = ysy.settings.templates.lastStateModal;
    var template = ysy.settings.templates.storedModal;
    //var obj = $.extend({}, ysy.view.getLabel("reloadModal"),{errors:errors});
    //var rendered = Mustache.render(template, {});
    $target.html(template);
    var loadServerIdea = function () {
      ysy.mapjs.setIdea(serverState);
      $target.dialog("close");
    };
    showModal("form-modal");
    $target.dialog({
          buttons: [
            {
              id: "last_state_modal_yes",
              text: ysy.settings.labels.buttons.button_yes,
              class: "wbs-last-modal-button button-1",
              click: function () {
                $target.dialog("close");
                ysy.mapjs.setIdea(MAPJS.content(last));
              }
            },
            {
              id: "last_state_modal_no",
              text: ysy.settings.labels.buttons.button_no,
              class: "wbs-last-modal-button button-2",
              click: loadServerIdea
            }
          ]
        })
        .on('dialogclose', loadServerIdea);
    $("#last_state_modal_yes").focus();
  }
});
