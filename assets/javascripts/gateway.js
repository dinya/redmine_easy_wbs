window.ysy = window.ysy || {};
ysy.gateway = ysy.gateway || {};
$.extend(ysy.gateway, {
  polymorficGet: function (urlTemplate, obj, callback, fail) {
    if (!urlTemplate) return;
    var url = urlTemplate.replace(":issueID",obj.issueID);
    $.get(url, obj)
        .done(callback)
        .fail(fail);
  },
  polymorficGetJSON: function (urlTemplate, obj, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.getJSON(url, obj)
        .done(callback)
        .fail(fail);
  },
  polymorficPost: function (urlTemplate, obj, data, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.ajax({
      url: url,
      type: "POST",
      data: data,
      dataType: "json"
    }).done(callback).fail(fail);
  },
  polymorficPut: function (urlTemplate, obj, data, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.ajax({
      url: url,
      type: "PUT",
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "text"
    }).done(callback).fail(fail);
  },
  polymorficDelete: function (urlTemplate, obj, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.ajax({
      url: url,
      type: "DELETE",
      dataType: "json"
    }).done(callback).fail(fail);
  }
});