window.ysy = window.ysy || {};
ysy.saver = ysy.saver || {};
$.extend(ysy.saver, {
  requestGroups: {},
  init: function () {
    //$("#button_save").click($.proxy(this.save, this));
    //$("#button_save").click(this.save);
  },
  save: function () {
    var projects = [];
    var issues = [];
    var idea = ysy.mapjs.idea;
    ysy.saver.deconstructIdeas(projects, issues, idea);
    //this.correctParents(entities);
    ysy.saver.sendOutSimple(projects, issues);
  },
  deconstructIdeas: function (projects, issues, idea, parent) {
    var ideaData = this.deconstructIdea(idea, parent);
    if (ideaData.recalculate) {
      var packet = {
        isPacket: true,
        parent: parent,
        idea: idea,
        data: ideaData
      };
      if (ideaData) packet.id = ideaData.id;
      ideaData = packet;
    }

    if (idea.attr.isProject) {
      projects.push(ideaData);
    } else {
      issues.push(ideaData);
    }
    for (var key in idea.ideas) {
      if (!idea.ideas.hasOwnProperty(key)) continue;
      var subIdea = idea.ideas[key];
      this.deconstructIdeas(projects, issues, subIdea, idea);
    }
  },
  deconstructIdea: function (idea, parent) {
    var data = ysy.mapModel.getData(idea);
    delete data.recalculate;
    if (idea.isProject || idea.attr.isProject) {
      var nameObj = {name: idea.title};
    } else {
      nameObj = {subject: idea.title};
    }
    ysy.mapModel.setData(idea, nameObj);
    ysy.mapModel.setData(idea, ysy.mapModel.exportParent(idea, parent));
    data = ysy.mapModel.getData(idea);
    return data;
    //ideaData.exportParent = ysy.mapModel.lazyExportParent(idea,parent);
  },
  /*sendOut: function (projects, issues) {
   var oldProjectsData = ysy.loader.sourceData.easy_wbs_data.projects;
   var oldIssuesData = ysy.loader.sourceData.easy_wbs_data.issues;
   var diff, oldIssue,oldProject;
   var dataToHash = function (array) {
   var hash = {}, entity;
   for (var i = 0; i < array.length; i++) {
   entity = array[i];
   hash[entity.id] = entity;
   }
   return hash;
   };
   var oldProjectHash = dataToHash(oldProjectsData);
   var oldIssueHash = dataToHash(oldIssuesData);

   for (var i = 0; i < projects.length; i++) {
   var project = projects[i];
   if (!oldProjectHash[project.id]) {
   this.prepareSend("POST", project,"project");
   } else {
   diff = this.getDiff(project);
   if (diff !== null) {
   this.prepareSend("PUT", diff,"project");
   }
   delete oldProjectHash[project.id];
   }
   }
   for (var id in oldProjectHash) {
   if (!oldProjectHash.hasOwnProperty(id)) continue;
   this.prepareSend("DELETE", oldProjectHash[id],"project");
   }
   for (i = 0; i < issues.length; i++) {
   var issue = issues[i];
   if (!oldIssueHash[issue.id]) {
   this.prepareSend("POST", issue);
   } else {
   diff = this.getDiff(issue);
   if (diff !== null) {
   this.prepareSend("PUT",diff);
   }
   delete oldIssueHash[issue.id];
   }
   }
   for (id in oldIssueHash) {
   if (!oldIssueHash.hasOwnProperty(id)) continue;
   this.prepareSend("DELETE", oldIssueHash[id]);
   }
   this.executeSend();
   },*/
  sendOutSimple: function (projects, issues) {
    var oldProjectsData = ysy.loader.sourceData.easy_wbs_data.projects;
    var oldIssuesData = ysy.loader.sourceData.easy_wbs_data.issues;
    var dataToHash = function (array) {
      var hash = {}, entity;
      for (var i = 0; i < array.length; i++) {
        entity = array[i];
        hash[entity.id] = entity;
      }
      return hash;
    };
    var oldProjectHash = dataToHash(oldProjectsData);
    var oldIssueHash = dataToHash(oldIssuesData);

    for (var i = 0; i < projects.length; i++) {
      var project = projects[i];
      if (!oldProjectHash[project.id]) {
        this.prepareSend({method: "POST", entity: project, type: "project"});
      } else {
        if (project._old || project.isPacket) {
          this.prepareSend({method: "PUT", entity: project, type: "project"});
        }
        oldProjectHash[project.id] = null;
      }
    }
    for (var id in oldProjectHash) {
      if (!oldProjectHash.hasOwnProperty(id)) continue;
      if (oldProjectHash[id] === null) continue;
      this.prepareSend({method: "DELETE", entity: oldProjectHash[id], type: "project", group: 4});
    }
    for (i = 0; i < issues.length; i++) {
      var issue = issues[i];
      if (!oldIssueHash.hasOwnProperty(issue.id)) {
        this.prepareSend({method: "POST", entity: issue, group: 2});
      } else {
        if (issue._old || issue.isPacket) {
          if (issue._old.parent_issue_id !== issue.parent_issue_id) {
            this.prepareSend({method: "PUT", entity: issue, group: 2.5});
          }
          this.prepareSend({method: "PUT", entity: issue, group: 3});
        }
        oldIssueHash[issue.id] = null;
      }
    }
    for (id in oldIssueHash) {
      if (!oldIssueHash.hasOwnProperty(id)) continue;
      if (oldIssueHash[id] === null) continue;
      this.prepareSend({method: "DELETE", entity: oldIssueHash[id], group: 4});
    }
    this.executeSend();
  },
  getDiff: function (entity) {
    if (!entity._old) return null;
    var diff = {};
    var old = entity._old;
    var found = false;
    var modifiedProps = Object.getOwnPropertyNames(entity);
    for (var i = 0; i < modifiedProps.length; i++) {
      var key = modifiedProps[i];
      if (key === "id") {
        diff[key] = entity[key];
        continue;
      }
      if (!old.hasOwnProperty(key))continue;
      if (old[key] !== entity[key]) {
        diff[key] = entity[key];
        found = true;
      }
    }
    if (found) {
      //console.log("old:");
      //console.log(old);
      return diff;
    }
    return null;
  },
  prepareSend: function (request) {
    request.type = request.type || "issue";
    var type = request.type;
    request.url = ysy.settings.paths[type + request.method].replace(":" + type + "ID", request.entity.id);
    if (!request.url) return;
    this.pushToGroup(request, request.group || 3);
  },
  pushToGroup: function (request, groupIndex) {
    if (!this.requestGroups[groupIndex]) {
      this.requestGroups[groupIndex] = [];
    }
    this.requestGroups[groupIndex].push(request);
  },
  executeSend: function (fails) {
    if (fails && fails.length) {
      return this.afterSave(fails);
    }
    var groupIndex = null;
    var groupIndices = Object.getOwnPropertyNames(this.requestGroups);
    for (var i = 0; i < groupIndices.length; i++) {
      var index = parseFloat(groupIndices[i]);
      if (groupIndex === null || groupIndex > index) {
        groupIndex = index;
      }
    }
    fails = [];
    if (groupIndex === null) return this.afterSave(fails);
    var requests = this.requestGroups[groupIndex];
    delete this.requestGroups[groupIndex];
    var nRequests = requests.length;
    var successes = 0;
    var resend = function (request) {
      if (groupIndex % 1 > 0.5) return false;
      ysy.saver.pushToGroup(request, groupIndex + 0.01);
      ysy.log.debug("pushToHigherGroup", "multisave");
      successes++;
      if (nRequests === successes + fails.length) {
        ysy.saver.executeSend(fails);
      }
      return true;
    };
    var oneSend = function (request) {
      var data = {};
      if (request.entity) {
        if (request.entity.isPacket) {
          var deconstructed = ysy.saver.deconstructIdea(request.entity.idea, request.entity.parent);
          if (deconstructed.recalculate) {
            if (resend(request)) return;
          }
          request.entity = deconstructed;
          data[request.type] = deconstructed;
          ysy.log.debug("onSave deconstruction", "multisave");
        } else {
          data[request.type] = request.entity;
        }
        delete data[request.type]._old;
      }
      if (ysy.settings.noSave) {
        console.log(request.method + " " + request.url + " " + JSON.stringify(request.data));
        return;
      }
      var xhr = $.ajax({
        method: request.method,
        url: request.url,
        type: request.type,
        dataType: "text",
        data: data
      });
      xhr.done(function (response) {
        if (request.method === "POST" && request.type === "issue") {
          request.response = response;
          ysy.saver.updateByPOST(request);
        }
        successes++;
      });
      xhr.fail(function (response) {
        request.response = response;
        fails.push(request);
      });
      xhr.complete(function () {
        if (nRequests === successes + fails.length) {
          ysy.saver.executeSend(fails);
        }
      });
    };
    _.each(requests, oneSend);
  },
  afterSave: function (fails) {
    if (fails.length > 0) {
      var errors = _.map(fails, function (fail) {
        return ysy.saver.createErrorNotice(fail)
      });
      ysy.util.showMessage(ysy.settings.labels.gateway.multiFail + "<br>" + errors.join("<br>"), "error");
      this.openReloadModal(errors);
    } else {
      ysy.util.showMessage(ysy.settings.labels.gateway.multiSuccess, "notice");
      ysy.storage.save(ysy.mapjs.idea);
      ysy.loader.load();
    }
  },
  updateByPOST: function (request) {
    // update issue by data from POST immediately, so children can use this issue id for their requests
    var source = JSON.parse(request.response).issue;
    //UPDATE all atributes, not just ID
    var keysToTransform = ["tracker", "status", "priority"];
    var wantedKeys = ["tracker_id", "status_id", "priority_id", "done_ratio", "id"];
    for (var i = 0; i < keysToTransform.length; i++) {
      var key = keysToTransform[i];
      if (_.isObject(source[key])) {
        source[key + "_id"] = source[key].id;
        delete source[key];
      }
    }
    $.extend(request.entity, _.pick(source, wantedKeys));
  },
  createErrorNotice: function (request) {
    var type = request.type;
    var method = request.method;
    var name = request.entity.name || request.entity.subject;
    var reason = null;
    var status = request.response.status;
    if (status === 403) {
      reason = ysy.settings.labels.gateway.response_403;
    } else {
      try {
        var responseJson = JSON.parse(request.response.responseText);
        if (responseJson.errors) {
          reason = responseJson.errors.join(", ");
        }
      } catch (e) {
      }
    }
    //if(method === "DELETE") {
    //
    //}else{
    //}
    var labels = ysy.settings.labels;
    return labels.types[type] + " " + name + " " + labels.gateway[method + "fail"] + ": " + (reason || request.response.statusText);
  },
  openReloadModal: function (errors) {
    var $target = ysy.util.getModal("form-modal", "50%");
    var template = ysy.settings.templates.reloadModal;
    //var obj = $.extend({}, ysy.view.getLabel("reloadModal"),{errors:errors});
    var rendered = Mustache.render(template, {errors: errors});
    $target.html(rendered);
    showModal("form-modal");
    $target.dialog({
      buttons: [
        {
          id: "reload_modal_yes",
          text: ysy.settings.labels.buttons.button_yes,
          class: "wbs-reload-modal-button button-1",
          click: function () {
            $target.dialog("close");
            $(".flash").remove();
            ysy.loader.load(true);
          }
        },
        {
          id: "reload_modal_no",
          text: ysy.settings.labels.buttons.button_no,
          class: "wbs-reload-modal-button button-2",
          click: function () {
            $target.dialog("close");
            ysy.storage.save(ysy.mapjs.idea);
          }
        }
      ]
    });
    $("#reload_modal_yes").focus();
  }
});