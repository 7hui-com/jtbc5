var jtbcMapQQ = {
  ready: function()
  {
    var that = this;
    that.map = new TMap.Map(document.querySelector('div.mapContainer'), {zoom: parentComponent.zoom, center: new TMap.LatLng(parentComponent.latitude, parentComponent.longitude)});
    that.map.on('center_changed', function(){
      var currentCenter = that.map.getCenter();
      var currentPoint = parentComponent.dialog.querySelector('div.currentPoint');
      parentComponent.latitude = currentCenter.lat;
      parentComponent.longitude = currentCenter.lng;
      if (currentPoint != null)
      {
        currentPoint.innerText = currentCenter.lng + ',' + currentCenter.lat;
      };
    });
    that.map.on('zoom', function(){
      parentComponent.zoom = that.map.getZoom();
    });
  },
}.ready();