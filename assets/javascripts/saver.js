window.ysy = window.ysy || {};
ysy.saver = ysy.saver || {};
$.extend(ysy.saver, {
  temp: null,
  init: function () {
    //$("#button_save").click($.proxy(this.save, this));
    //$("#button_save").click(this.save);
  },
  save: function () {
    var idea = ysy.mapjs.idea;
    this.temp = {
      nLeafs: 1,
      fails: []
    };
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
    this.temp.oldProjectHash = dataToHash(oldProjectsData);
    this.temp.oldIssueHash = dataToHash(oldIssuesData);
    this.sendNode(idea);
    this.temp.responsePhase = true;
    this.finishCheck();
  },
  sendNode: function (node, parent) {
    ysy.log.debug("sendNode for " + node.title, "send");
    var oldProjectHash = this.temp.oldProjectHash;
    var oldIssueHash = this.temp.oldIssueHash;
    var entity = this.deconstructIdea(node, parent);
    var request = null;
    if (node.attr.isProject) {
      if (!oldProjectHash[entity.id]) {
        request = this.prepareRequest({method: "POST", entity: entity, type: "project"});
      } else {
        if (entity._old) {
          request = this.prepareRequest({method: "PUT", entity: entity, type: "project"});
        }
        oldProjectHash[entity.id] = null;
      }
    } else {
      if (!oldIssueHash.hasOwnProperty(entity.id)) {
        request = this.prepareRequest({method: "POST", entity: entity});
      } else {
        if (entity._old) {
          if (entity._old.parent_issue_id !== entity.parent_issue_id
              && entity.parent_issue_id
              && entity._old.parent_issue_id) {
            entity._old.parent_issue_id = null;
            request = this.prepareRequest({
              method: "PUT", entity: {
                id: entity.id,
                parent_issue_id: null,
                subject: entity.subject
              }, node: this.createInclusion(node, parent)
            });
          } else {
            request = this.prepareRequest({method: "PUT", entity: entity});
          }
        }
        oldIssueHash[entity.id] = null;
      }
    }
    if (request) {
      if (!request.node) request.node = node;
      this.send(request);
    } else {
      this.prepareChildren(node);
    }
  },
  createInclusion: function (node, parent) {
    return {
      attr: {data: {id: ysy.mapModel.getData(parent).id}},
      id: parent.id,
      ideas: {1: node},
      title: node.title + " inclusion"
    }
  },
  prepareRequest: function (request) {
    request.type = request.type || "issue";
    var type = request.type;
    var url = ysy.settings.paths[type + request.method];
    if (!url) url = "";
    //if(!url) return null;
    request.url = url.replace(":" + type + "ID", request.entity.id);
    return request;
  },
  prepareChildren: function (node) {
    if (node && node.ideas) {
      ysy.log.debug("prepareChildren for " + node.title, "send");
      var children = _.values(node.ideas);
      for (var i = 0; i < children.length; i++) {
        this.temp.nLeafs++;
        var childNode = children[i];
        this.sendNode(childNode, node);
      }
    }
    this.temp.nLeafs--;
    this.finishCheck();
  },
  finishCheck: function () {
    if (!this.temp.responsePhase) return;
    if (this.temp.nLeafs !== 0) return;
    if (this.temp.deletePhase) {
      this.afterSave();
    } else {
      this.sendDeletes();
    }
  },
  deconstructIdea: function (idea, parent) {
    ysy.mapModel.setData(idea, ysy.mapModel.exportParent(idea, parent));
    if (idea.isProject || idea.attr.isProject) {
      var nameObj = {name: idea.title};
    } else {
      nameObj = {subject: idea.title};
    }
    ysy.mapModel.setData(idea, nameObj);
    return ysy.mapModel.getData(idea);
  },
  sendDeletes: function () {
    ysy.log.debug("sendDeletes", "send");
    this.temp.deletePhase = true;
    var oldProjectHash = this.temp.oldProjectHash;
    var oldIssueHash = this.temp.oldIssueHash;
    for (var id in oldProjectHash) {
      if (!oldProjectHash.hasOwnProperty(id)) continue;
      if (oldProjectHash[id] === null) continue;
      var request = this.prepareRequest({method: "DELETE", entity: oldProjectHash[id], type: "project"});
      this.send(request);
    }
    for (id in oldIssueHash) {
      if (!oldIssueHash.hasOwnProperty(id)) continue;
      if (oldIssueHash[id] === null) continue;
      request = this.prepareRequest({method: "DELETE", entity: oldIssueHash[id]});
      this.send(request);
    }
    this.finishCheck();
  },
  parallelSend: function (request) { // parallel send
    if (!request) return;
    ysy.log.debug("send for " + (request.entity.subject || request.entity.name), "send");
    var data = {};
    if (request.entity) {
      data[request.type] = request.entity;
      delete data[request.type]._old;
    }
    //console.log(request.method + " " + request.url + " " + JSON.stringify(data));
    if (ysy.settings.noSave) {
      setTimeout(function () {
        if (request.node) {
          ysy.saver.prepareChildren(request.node);
        }
      }, 1000);
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
    });
    xhr.fail(function (response) {
      request.response = response;
      ysy.saver.temp.fails.push(request);
    });
    xhr.complete(function () {
      ysy.saver.prepareChildren(request.node);
    });
  },
  send: function (request, skipPrepare) {  // sequential send
    var temp = this.temp;
    if (!request) return;
    ysy.log.debug("send for " + (request.entity.subject || request.entity.name), "send");
    if (!skipPrepare) {
      request.data = {};
      if (request.entity) {
        request.data[request.type] = request.entity;
        delete request.data[request.type]._old;
      }
    }
    //console.log(request.method + " " + request.url + " " + JSON.stringify(data));
    if (ysy.settings.noSave) {
      setTimeout(function () {
        if (request.node) {
          ysy.saver.prepareChildren(request.node);
        }
      }, 1000);
      return;
    }
    if (temp.requestOnWay) {
      if (!temp.requestStack) temp.requestStack = [];
      temp.requestStack.push(request);
      return;
    }
    temp.requestOnWay = true;
    var xhr = $.ajax({
      method: request.method,
      url: request.url,
      type: request.type,
      dataType: "text",
      data: request.data
    });
    xhr.done(function (response) {
      if (request.method === "POST" && request.type === "issue") {
        request.response = response;
        ysy.saver.updateByPOST(request);
      }
    });
    xhr.fail(function (response) {
      request.response = response;
      ysy.saver.temp.fails.push(request);
    });
    xhr.complete(function () {
      temp.requestOnWay = false;
      if (temp.requestStack && temp.requestStack.length) {
        var nextRequest = temp.requestStack.shift();
        ysy.saver.send(nextRequest, true);
      }

      ysy.saver.prepareChildren(request.node);
    });
  },

  //getDiff: function (entity) {
  //  if (!entity._old) return null;
  //  var diff = {};
  //  var old = entity._old;
  //  var found = false;
  //  var modifiedProps = Object.getOwnPropertyNames(entity);
  //  for (var i = 0; i < modifiedProps.length; i++) {
  //    var key = modifiedProps[i];
  //    if (key === "id") {
  //      diff[key] = entity[key];
  //      continue;
  //    }
  //    if (!old.hasOwnProperty(key))continue;
  //    if (old[key] !== entity[key]) {
  //      diff[key] = entity[key];
  //      found = true;
  //    }
  //  }
  //  if (found) {
  //    //console.log("old:");
  //    //console.log(old);
  //    return diff;
  //  }
  //  return null;
  //},
  afterSave: function () {
    ysy.log.debug("afterSave", "send");
    var fails = this.temp.fails;
    if (fails.length > 0) {
      var errors = _.map(fails, function (fail) {
        return ysy.saver.createErrorNotice(fail)
      });
      ysy.util.showMessage(ysy.settings.labels.gateway.multiFail + "<br>" + errors.join("<br>"), "error");
      this.openReloadModal(errors);
    } else {
      ysy.util.showMessage(ysy.settings.labels.gateway.multiSuccess, "notice", 1000);
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
            ysy.storage.lastState.remove();
            ysy.loader.load();
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