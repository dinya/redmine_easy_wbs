window.ysy = window.ysy || {};
ysy.view = ysy.view || {};
ysy.view.modals = ysy.view.modals || {};
$.extend(ysy.view.modals, {
  _cache: {},
  init: function () {
    var mapModel = ysy.mapjs.getModel();
    $("#container").off("click.exclamation").on("click.exclamation", ".mapjs-exclamation", function () {
      var contextNodeId = mapModel.getSelectedNodeId();
      ysy.mapjs.getModel().dispatchEvent('nodeEditDataRequested', contextNodeId);
    });
    var $target, idea, preFill;
    mapModel.addEventListener('nodeEditDataRequested', function (nodeId) {
      idea = mapModel.findIdeaById(nodeId);
      preFill = $.extend(true,
          {project_id: ysy.settings.projectID},
          ysy.mapModel.getData(idea),
          {subject: idea.title},
          ysy.mapModel.exportParent(idea, null, true)
      );
      if (idea.attr.isProject) {

      } else {
        $target = ysy.util.getModal("form-modal", "90%");
        if (preFill.id) {
          openEditIssueModal();
        } else {
          openNewIssueModal();
        }
      }

    });
    var submitFunction = function (e) {
      if (window.fillFormTextAreaFromCKEditor) {
        window.fillFormTextAreaFromCKEditor("issue_description");
      }
      var errors = [];
      $target.find("label.required, label .required").each(function () {
        var $label = $(this).closest("label");
        var $input = $label.parent().find("#" + $label.attr("for"));
        if (!$input.length) return;
        //var $input = $label.next();
        if (!$input.val()) {
          var label = $label.text();
          errors.push(label.substring(0, label.length - 2) + " cannot be empty"/* + ysy.view.getLabel("addTask", "error_blank")*/);
        }
      });
      if (errors.length) {
        var errorSpan = $('<span></span>').html(errors.join("<br>"));
        var closeButton = $('<a href="javascript:void(0)" class="close-icon close_button"></a>').click(function (event) {
          $(this)
              .closest('.flash')
              .fadeOut(500, function () {
                $(this).remove();
              })
        });
        $target.prepend($('<div class="flash error"></div>').append(errorSpan, closeButton));
        //dhtmlx.message(errors.join("<br>"),"error");
        return false;
      }
      if ($(this).is("form")) {
        var data = $(this).serializeArray();
      } else {
        data = $target.find("form").serializeArray();
      }
      var transformed = ysy.view.modals.transformData(data);
      //if (addType === "project") {
      //  ysy.pro.addTask.createMilestone(transformed);
      //} else {
      ysy.view.modals.createIssue(idea, transformed);
      //}
      $target.dialog("close");
      return false;
    };
    var openNewIssueModal = function () {
      //if (ysy.view.modals._cache["new_" + preFill.project_id]) {
      //  return finishModal("new", "issue", false);
      //}
      ysy.gateway.polymorficGet(ysy.settings.paths.newIssuePath, {
        projectID: preFill.project_id,
        issue: preFill
      }, function (data) {
        //$target.html(data);
        ysy.view.modals._cache["new_" + preFill.project_id] = $(data);
        finishModal("new", "issue", true);
      });

    };
    var openEditIssueModal = function () {
      //if (ysy.view.modals._cache["edit_" + preFill.project_id]) {
      //  return finishModal("edit", "issue", false);
      //}
      var path = ysy.settings.paths.editIssuePath.replace(":issueID", preFill.id);
      ysy.gateway.polymorficGet(path, {
        projectID: preFill.project_id,
        issue: preFill
      }, function (data) {
        var $form = $(data);
        if ($form.find("#content").length) {
          $form = $form.find("#issue-form");
        }
        $form.find(".issue_edit_submit_buttons").remove();
        var $attributes = $form.find("#all_attributes, #form-attributes");
        $form.find(".box:first").replaceWith($attributes);
        $form.find(".box").not($attributes).remove();
        if (ysy.settings.easyRedmine) {
          $form.find("#issue_descr_fields").show();
          $form.find(".issue-edit-hidden-attributes").remove();
        }
        ysy.view.modals._cache["edit_" + preFill.project_id] = $form;
        finishModal("edit", "issue", true);
      });

    };
    var finishModal = function (actionType, entityType, first) {
      var template = ysy.view.modals._cache[actionType + "_" + preFill.project_id];
      $target.empty().append(template.clone());
      if (!first) {
        var $form = $target.find("form");

        $.each(preFill, function (name, val) {
          if (_.isArray(val)) {
            for (var i = 0; i < val.length; i++) {
              $form.find('[name="issue[' + name + '][]"]')
                  .filter('[value="' + val[i] + '"]')
                  .attr('checked', 'checked');
            }
            return;
          }
          var $el = $form.find('[name="issue[' + name + ']"]'),
              type = $el.attr('type');
          switch (type) {
            case 'checkbox':
              $el.attr('checked', 'checked');
              break;
            case 'radio':
              $el.filter('[value="' + val + '"]').attr('checked', 'checked');
              break;
            default:
              $el.val(val);
          }
        });
      }
      $target.find("h2, h3.title").remove();
      $target.prepend($("<h3 class='title'>" + ysy.settings.labels.modals[actionType + "_" + entityType] + "</h3>"));
      showModal("form-modal");
      $target.find("input[type=submit], .form-actions").hide();
      $target.addClass("tabular");
      $target.dialog({
        buttons: [
          {
            //id: "add_issue_modal_submit",
            class: "button-1 button-positive",
            text: "Update",
            click: submitFunction
          }
        ]
      });
      $target.find("#issue-form").submit(submitFunction)
          .append($('<input type="hidden" name="version[project_id]" value="' + preFill.project_id + '" />'));
    };
  },
  transformData: function (data) {
    //var momentarize=function(date){return moment(date,"YYYY-MM-DD");};
    //var momentarizeEnd=function(date){var mom=moment(date,"YYYY-MM-DD");mom._isEndDate=true;return mom;};
    var transformed = {
      project_id: ysy.settings.projectID
    };
    var keyDeIssue = function (key) {
      return key.substring(key.indexOf("[") + 1, key.indexOf("]"));
    };
    var nothing = function (string) {
      return string;
    };
    var parse = function (number) {
      if (number === "") return null;
      return parseInt(number);
    };
    var parseDecimal = function (number) {
      if (number === "") return null;
      return parseFloat(number);
    };
    var parseObject = function (masterKey) {
      return function (value, key) {
        var index = keyDeIssue(key.replace("[" + masterKey + "]", ""));
        if (transformed[masterKey] === undefined) {
          transformed[masterKey] = {};
        }
        transformed[masterKey][index] = value;
        return null;
      }
    };
    var parseArray = function (masterKey) {
      return function (value, key) {
        if (!value) return null;
        var index = keyDeIssue(key.replace("[" + masterKey + "]", ""));
        if (index) {
          if (transformed[masterKey] === undefined) {
            transformed[masterKey] = {};
          }
          if (transformed[masterKey][index] === undefined) {
            transformed[masterKey][index] = [];
          }
          transformed[masterKey][index].push(value);
        } else {
          if (transformed[masterKey] === undefined) {
            transformed[masterKey] = [];
          }
          transformed[masterKey].push(value);
        }
        return null;
      }
    };
    var functionMap = {
      name: nothing,
      is_private: parse,
      tracker_id: parse,
      status_id: parse,
      status: nothing,
      sharing: nothing,
      subject: nothing,//function(value){transformed.name=value;return null},
      description: nothing,
      priority_id: parse,
      project_id: parse,
      assigned_to_id: parse,
      fixed_version_id: parse,
      easy_version_category_id: parse,
      old_fixed_version_id: parse,
      parent_issue_id: parse,
      start_date: nothing,
      due_date: nothing,
      effective_date: function (value) {
        transformed.start_date = value;
        return null;
      },
      estimated_hours: parseDecimal,
      done_ratio: parse,
      custom_field_values: parseObject("custom_field_values"),
      easy_distributed_tasks: parseArray("easy_distributed_tasks"),
      easy_repeat_settings: parseObject("easy_repeat_settings"),
      easy_repeat_simple_repeat_end_at: nothing,
      watcher_user_ids: parseArray("watcher_user_ids"),
      easy_ldap_entity_mapping: nothing,
      activity_id: parse
    };
    for (var i = 0; i < data.length; i++) {
      var key = data[i].name;
      var shortKey = keyDeIssue(key);
      if (functionMap.hasOwnProperty(shortKey)) {
        var parsed = functionMap[shortKey](data[i].value, key);
        if (parsed === null) continue;
        transformed[shortKey] = parsed;
      }
    }
    return transformed;
  },
  createIssue: function (idea, transformed) {
    ysy.mapModel.setData(idea, transformed);
    idea.title = idea.attr.data.subject;
    ysy.mapjs.getModel().getIdea().dispatchEvent("changed");
  }
});