window.ysy = window.ysy || {};
ysy.validator = ysy.validator || {};
$.extend(ysy.validator, {
  changeParent: function (child, newParent) {
    var childData = ysy.mapModel.getData(child);
    if (!childData.tracker_id) return true;
    var tracker = _.find(ysy.data.trackers, function (item) {
      return item.id === childData.tracker_id;
    });
    if (!tracker.subtaskable) {
      showFlashMessage("error", ysy.settings.labels.errors.not_subtaskable.replace("%{task_name}", child.title));
      return false;
    }
    return true;

  },
  removeSubIdea: function (ideaId, eventOrigin) {
    var mainIdea = ysy.mapjs.idea;
    if (!mainIdea) return false;
    var idea = mainIdea.findSubIdeaById(ideaId);
    return (idea && idea.attr && !idea.attr.isProject);
  }
});