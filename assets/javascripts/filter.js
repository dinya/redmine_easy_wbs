window.ysy = window.ysy || {};
ysy.filter = ysy.filter || {};
$.extend(ysy.filter, {
  allowedValues: [],
  key: "",
  className: "wbs-node-filtered",
  pushAllowed: function (value) {
  },
  removeAllowed: function (value) {
  },
  toggleAllowed: function (value) {
  },
  cssByBannedValue: function (value) {
    return "";
  },
  reset: function () {
  },
  isBanned: function (idea) {
    return false;
  }
});