MAPJS.initAll = function () {
  //jQuery.fn.attachmentEditorWidget = function (mapModel) {
  //  'use strict';
  //  return this.each(function () {
  //    var element = jQuery(this);
  //    mapModel.addEventListener('attachmentOpened', function (nodeId, attachment) {
  //      mapModel.setAttachment(
  //          'attachmentEditorWidget',
  //          nodeId, {
  //            contentType: 'text/html',
  //            content: prompt('attachment', attachment && attachment.content)
  //          }
  //      );
  //    });
  //  });
  //};


  window.onerror = ysy.log.error;
  var container = jQuery('#container'),
      //idea = MAPJS.content(test_tree()),
      imageInsertController = new MAPJS.ImageInsertController("http://localhost:4999?u="),
      mapModel = new MAPJS.MapModel(MAPJS.DOMRender.layoutCalculator, []);
  container.domMapWidget(console, mapModel, false, imageInsertController);
  jQuery('#wbs_menu').mapToolbarWidget(mapModel);
  //jQuery('body').attachmentEditorWidget(mapModel);
  //$("[data-mm-action='export-image']").click(function () {
  //  MAPJS.pngExport(idea).then(function (url) {
  //    window.open(url, '_blank');
  //  });
  //});
  //mapModel.setIdea(idea);  // < HOSEK
  //jQuery('#linkEditWidget').linkEditWidget(mapModel);
  MAPJS.DOMRender.stageMargin = {top: 50, left: 50, bottom: 50, right: 50};
  window.mapModel = mapModel;
  //jQuery('.arrow').click(function () {
  //  jQuery(this).toggleClass('active');
  //});
  imageInsertController.addEventListener('imageInsertError', function (reason) {
    ysy.log.error('image insert error', reason);
  });
  //container.on('drop', function (e) {
  //  var dataTransfer = e.originalEvent.dataTransfer;
  //  e.stopPropagation();
  //  e.preventDefault();
  //  if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
  //    var fileInfo = dataTransfer.files[0];
  //    if (/\.mup$/.test(fileInfo.name)) {
  //      var oFReader = new FileReader();
  //      oFReader.onload = function (oFREvent) {
  //        mapModel.setIdea(MAPJS.content(JSON.parse(oFREvent.target.result)));
  //      };
  //      oFReader.readAsText(fileInfo, 'UTF-8');
  //    }
  //  }
  //});
};
