window.ysy = window.ysy || {};
ysy.mapjs = ysy.mapjs || {};
$.extend(ysy.mapjs, {
  idea: null,
  setIdea: function (idea) {
    ysy.storage.lastState.remove();
    this.idea = idea;
    window.mapModel.setIdea(idea);
    idea.addEventListener('changed', function () {
      ysy.storage.save(idea);
    });
    ysy.main.afterLoad();
  },
  getModel: function () {
    return window.mapModel;
  },
  getNodeElement: function (nodeId) {
    return window.mapModel.getCurrentLayout().nodes[nodeId];
  }
});
ysy.mapModel = ysy.mapModel || {};
$.extend(ysy.mapModel, {
  getData: function (idea) {
    if (!idea) return false;
    if (!idea.attr) idea.attr = {};
    if (!idea.attr.data) idea.attr.data = {};
    return idea.attr.data;
  },
  setData: function (idea, obj) {
    if (!idea) return false;
    if (!idea.attr) idea.attr = {};
    if (!idea.attr.data) idea.attr.data = {};
    var data = idea.attr.data;
    var props = Object.getOwnPropertyNames(obj);
    for (var i = 0; i < props.length; i++) {
      var key = props[i];
      if (obj[key] !== data[key]) {
        if (!data[key] && !obj[key]) continue;
        if (!data._old) data._old = {};
        data._old[key] = data[key];
        data[key] = obj[key];
      }
    }

  },
  importParent: function (idea) {

  },
  exportParent: function (idea, parent) {
    parent = parent || ysy.mapjs.getModel().getIdea().findParent(idea.id);
    if (!parent) return {};
    var parentData = ysy.mapModel.getData(parent);
    if (parent.attr.isProject) {
      if (idea.attr.isProject) {
        return {parent_id: parentData.id};
      } else {
        return {
          project_id: parentData.id,
          parent_issue_id: null
        };
      }
    } else {
      var parentMap = {parent_issue_id: parentData.id};
      var superIdea = ysy.mapjs.getModel().getIdea();
      while (parent && !parent.attr.isProject) {
        parent = superIdea.findParent(parent.id);
      }
      if (parent) {
        parentMap.project_id = ysy.mapModel.getData(parent).id;
      }
      return parentMap;
    }
  },
  getNodeByIdea: function (idea) {
    return $("#node_" + idea.id);
  }
});