window.ysy = window.ysy || {};
ysy.log = {
  logLevel: 2,
  mainDebug: "",
  debugTypes: [
    //"keys",
    //"diff",
    //"send",
    //"storage",
    //"events",
    //"redraw",
    //"multisave",
    "nothing"
  ],
  log: function (text) {
    if (this.logLevel >= 4) {
      this.print(text);
    }
  },
  message: function (text) {
    if (this.logLevel >= 3) {
      this.print(text);
    }
  },
  debug: function (text, type) {
    if (type) {
      if (this.mainDebug === type) {
        this.print(text, "debug");
        return;
      }
      for (var i = 0; i < this.debugTypes.length; i++) {
        if (this.debugTypes[i] === type) {
          this.print(text, type === this.mainDebug ? "debug" : null);
          return;
        }
      }
    } else {
      this.print(text, "debug");
    }
  },
  warning: function (text) {
    if (this.logLevel >= 2) {
      this.print(text, "warning");
    }
  },
  error: function (text) {
    if (this.logLevel >= 1) {
      this.print(text, "error");
    }
  },
  print: function (text, type) {
    if (type === "error") {
      console.error(text);
    } else if (type === "warning") {
      console.warn(text);
    } else if (type === "debug") {
      console.debug(text);
    } else {
      console.log(text);
    }
  }
};
