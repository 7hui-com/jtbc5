var jtbcMapTianditu = {
  ready: function()
  {
    var that = this;
    that.map = new T.Map(document.querySelector('div.mapContainer'));
    that.map.centerAndZoom(new T.LngLat(parentComponent.longitude, parentComponent.latitude), parentComponent.zoom);
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