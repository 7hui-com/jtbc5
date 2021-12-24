var jtbcMapAMap = {
  ready: function()
  {
    var that = this;
    that.map = new AMap.Map(document.querySelector('div.mapContainer'), {zoom: parentComponent.zoom, center: [parentComponent.longitude, parentComponent.latitude]});
    that.map.addControl(new AMap.Scale());
    that.map.addControl(new AMap.ToolBar());
    that.map.on('moveend', function() {
      var currentCenter = that.map.getCenter();
      var currentPoint = parentComponent.dialog.querySelector('div.currentPoint');
      parentComponent.latitude = currentCenter.lat;
      parentComponent.longitude = currentCenter.lng;
      if (currentPoint != null)
      {
        currentPoint.innerText = currentCenter.lng + ',' + currentCenter.lat;
      };
    });
    that.map.on('zoomend', function() {
      parentComponent.zoom = that.map.getZoom();
    });
  },
}.ready();