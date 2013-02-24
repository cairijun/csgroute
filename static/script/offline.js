function GMapsMapTypeFactory() {}
GMapsMapTypeFactory.createMapType = function (name,mapTilePath) {
  var getTileUrl = function (coord, zoom) {
    var numTiles = (1 << zoom);
    if ((coord.x < 0) || (coord.x >= numTiles) || (coord.y < 0) || (coord.y >= numTiles)) {
      return null;
    }
    return mapTilePath + zoom + "/" + coord.x + "/" + coord.y + ".jpg";
  };

  var imageMapTypeOptions = {
    "name":name,
    "tileSize": new google.maps.Size(256, 256),
    "maxZoom": 19,
    "minZoom": 10,
    "getTileUrl": getTileUrl,
    "isPng": true,
    "opacity": 1.0
  };

  return new google.maps.ImageMapType(imageMapTypeOptions);
}

function GRoadMapTypeFactory() {}
GRoadMapTypeFactory.createMapType = function (name,mapTilePath) {
  var getTileUrl = function (coord, zoom) {
    var numTiles = (1 << zoom);
    if ((coord.x < 0) || (coord.x >= numTiles) || (coord.y < 0) || (coord.y >= numTiles)) {
      return null;
    }
    return mapTilePath + zoom + "/" + coord.x + "/" + coord.y + ".png";
  };

  var imageMapTypeOptions = {
    "name":name,
    "tileSize": new google.maps.Size(256, 256),
    "maxZoom": 19,
    "minZoom": 10,
    "getTileUrl": getTileUrl,
    "isPng": true,
    "opacity": 1.0
  };

  return new google.maps.ImageMapType(imageMapTypeOptions);
}

function addMarkerLayersTile() {
  var label = new google.maps.ImageMapType({
    getTileUrl:function (tile, zoom) {
      return  "maptile/googlemaps/overlay/"+ zoom + "/" + tile.x + "/" + tile.y + ".png";
    },
    tileSize:new google.maps.Size(256, 256),
    isPng:true
  });
  map.overlayMapTypes.insertAt(0, label);
}

function removeOverlayMapType() {
  try {
    map.overlayMapTypes.removeAt(0);
  }
  catch (e) {
    // skip
  }
}
