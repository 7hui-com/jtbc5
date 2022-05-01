var jtbcMapQQ = {
  ready: function()
  {
    document.querySelector('div.mapContainer').addEventListener('addMarker', function(e){
      e.detail.result = new TMap.MultiMarker({
        'map': e.detail.mapInstance,
        'styles': { 'marker': new TMap.MarkerStyle({'width': 30, 'height': 30, 'anchor': { x: 15, y: 30 }, 'src': e.detail.icon}) },
        'geometries': [{'styleId': 'marker', 'position': e.detail.point}],
      });
    });
  },
}.ready();