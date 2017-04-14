window.ysy = window.ysy || {};
ysy.util = ysy.util || {};
$.extend(ysy.util, {
  _messages: [],
  _messageType: "notice",
  _lastMessageTime: 0,
  init: function () {
  },
  showMessage: function (message, type, delay) {
    var flash = $("#content").children(".flash");
    var now = new Date().valueOf();
    if (!flash.length || this._lastMessageTime + 60 * 1000 < now || this._messageType === "notice") {
      window.showFlashMessage(type, message, delay);
      this._lastMessageTime = now;
      this._messages = [message];
      this._messageType = type;
      return;
    }
    if (type === "notice") return;
    this._lastMessageTime = now;
    this._messages.push(message);
    if (type === "error" && this._messageType === "warning") {
      window.showFlashMessage(type, this._messages.join("<br>"), delay);
      this._messageType = type;
    } else {
      flash.find("span").html(this._messages.join("<br>"));
    }
  },
  getModal: function (id, width) {
    var $target = $("#" + id);
    if ($target.length === 0) {
      $target = $("<div id=" + id + ">");
      $target.dialog({
        width: width,
        appendTo: document.body,
        modal: true,
        resizable: false,
        dialogClass: 'modal'
      });
      $target.dialog("close");
    }
    return $target;
  },
  startsWith: function (text, char) {
    if (text.startsWith) {
      return text.startsWith(char);
    }
    return text.charAt(0) === char;
  },
  isEquivalent: function (a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  },
  showUpgradeModal: function (feature) {
    var $target = ysy.util.getModal("form-modal", "auto");
    var template = ysy.settings.templates.upgrade;
    //var obj = $.extend({}, ysy.view.getLabel("reloadModal"),{errors:errors});
    var obj = {};
    obj[feature] = true;
    var rendered = Mustache.render(template, obj);
    $target.html(rendered);
    showModal("form-modal");
    $target.dialog({
      buttons: [
        {
          id: "upgrade_button",
          class: "button-1 button-positive",
          text: ysy.settings.labels.free.buttonUpgrade,
          click: function () {
            var $link = $target.find("#upgrade_link");
            //$link.show().click();
            window.open($link.attr("href"), '_blank');
            $target.dialog("close");
          }
        },
        {
          id: "close_button",
          class: "button-2 button",
          text: ysy.settings.labels.buttons.close,
          click: function () {
            $target.dialog("close");
          }
        }
      ]
    });
    $target.parent().find("#upgrade_button").focus();
  }
});