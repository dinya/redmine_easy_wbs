window.ysy = window.ysy || {};
ysy.storage = ysy.storage || {};
$.extend(ysy.storage, {
  save: function (idea) {
  }
});
//###################################################################################################
ysy.storage.extra = {
  save: function (idea) {
  },
  enhanceData: function (data, root) {
    return data;
  }
};
//#######################################################################################
ysy.storage.lastState = {
  save: function (idea) {
  },
  getSavedIdea: function () {
    return null;
  },
  remove: function () {
  },
  compareIdea: function (idea, diffType) {
    return null;
  }
};
//######################################################################################
ysy.storage.settings = {
  load: function (idea) {
  },
  save: function (idea) {
  }
};