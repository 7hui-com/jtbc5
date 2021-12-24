var jtbcMapBaidu = {
  ready: function()
  {
    var that = this;
    that.map = new BMapGL.Map(document.querySelector('div.mapContainer'));
    that.map.centerAndZoom(new BMapGL.Point(parentComponent.longitude, parentComponent.latitude), parentComponent.zoom);
    that.map.addControl(new BMapGL.ScaleControl());
    that.map.addControl(new BMapGL.ZoomControl());
    that.map.enableScrollWheelZoom(true);
    var mapCenterChanged = function()
    {
      var currentCenter = that.map.getCenter();
      var currentPoint = parentComponent.dialog.querySelector('div.currentPoint');
      parentComponent.latitude = currentCenter.lat;
      parentComponent.longitude = currentCenter.lng;
      if (currentPoint != null)
      {
        currentPoint.innerText = currentCenter.lng + ',' + currentCenter.lat;
      };
    };
    that.map.addEventListener('moveend', function() { mapCenterChanged(); });
    that.map.addEventListener('zoomend', function() {
      mapCenterChanged();
      parentComponent.zoom = that.map.getZoom();
    });
  },
}.ready();