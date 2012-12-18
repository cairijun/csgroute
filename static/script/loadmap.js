//地图初始化
function initMap(container) {
  if(typeof(map) == 'undefined') {
    var centerLatLng = new google.maps.LatLng(23.066944,113.386667);
    var options = {
      zoom : 14,
      center : centerLatLng,
      mapTypeId : google.maps.MapTypeId.ROADMAP
    };
    if(typeof(container) == 'undefined')
      container = "mapContainer";
    map = new google.maps.Map(document.getElementById(container),
                              options);
    gLine = null;
    gMarkersArray = [];
    gInfoWindow = null;
  }
}

function clearMap() {
  if(gLine) {
    gLine.setMap(null);
    gLine = null;
  }

  if(gMarkersArray) {
    for(i = 0 ; i < gMarkersArray.length ; i++) {
      if(gMarkersArray[i] != null) {
        gMarkersArray[i].setMap(null);
      }
    }
    gMarkersArray.length = 0;
  }

  if(gInfoWindow) {
    gInfoWindow = null;
  }
}

//绘制一条线路
function drawARoute(line, markers, admin) {
  clearMap();
  //画线路
  gLine = new google.maps.Polyline({
    strokeColor : line.strokeColor,
    strokeWeight : line.strokeWeight,
    strokeOpacity : line.strokeOpacity,
    editable : admin,
    map : map
  });
  thePath = gLine.getPath();
  var i = 0;
  for(i = 0 ; i < line.path.length ; i++) {
    thePath.push(new google.maps.LatLng(
      line.path[i][0], line.path[i][1]));
  }
  regLineEvents(gLine);

  //画标记点
  gInfoWindow = new google.maps.InfoWindow({});
  for(i = 0 ; i < markers.length ; i++) {
    _marker = new google.maps.Marker({
      map : map,
      draggable : admin,
      title : markers[i].title,
      position :
        new google.maps.LatLng(
          markers[i].position[0], markers[i].position[1])
    });
    _marker.content = markers[i].content;
    regMarkerEvents(_marker);
    _marker.index = gMarkersArray.index;
    gMarkersArray.push(_marker);
  }
}

function regLineEvents(line) {
  //注册线路删除事件
  //右键点击线路上的点为删除
  google.maps.event.addListener(line, 'rightclick', function(e) {
    if(gAddMode && ('vertex' in e)) {
      line.getPath().removeAt(e.vertex);
    }
  });
}
function regMarkerEvents(marker) {
  //注册锚点的InfoWindow事件
  google.maps.event.addListener(
    marker, 'click',
    function() {
      gInfoWindow.setContent(
        '<b>' + this.getTitle() + '</b><br />' + this.content
      );
      gInfoWindow.open(map, this);
    }
  );
  //注册锚点的删除事件
  //右键点击锚点为删除
  google.maps.event.addListener(
    marker, 'rightclick',
    function() {
      if(gAddMode) {
        this.setMap(null);
        gMarkersArray[this.index] = null;
      }
    }
  );
}

//向页面加载一条线路
function loadARoute(routeId, admin) {
  if(typeof(map) == 'undefined') {
    initMap();
  }
  if(typeof(admin) == 'undefined') {
    admin = false;
  }
  if(routeId.charAt(0) == '#') {
    clearMap();//如果是新建线路，直接清除地图
    gLine = new google.maps.Polyline({
      editable : true,
      map : map
    });
    google.maps.event.addListener(gLine, 'rightclick', function(e) {
      if(gAddMode && ('vertex' in e)) {
        gLine.getPath().removeAt(e.vertex);
      }
    });
    gInfoWindow = new google.maps.InfoWindow({});
    return true;
  }
  $.getJSON('?c=default&a=ajax_getroutes&route_id=' + routeId, function(data) {
    var line = data[0].line;
    var markers = data[0].markers;
    var startPoint = line.path[0];
    if(!startPoint && data[0].markers[0]) {
      startPoint = data[0].markers[0].position;
    }
    var endPoint = line.path[line.path.length - 1];
    if(!endPoint && startPoint) {
      endPoint = startPoint;
    }
    if(startPoint) {
      var centerPoint = new google.maps.LatLng(
        (startPoint[0] + endPoint[0]) / 2,
        (startPoint[1] + endPoint[1]) / 2
      );
      map.setCenter(centerPoint);
    }
    drawARoute(line, markers, admin);
    if(admin)
      gAddMode = true;
    else
      gAddMode = false;
  });
}

$(document).ready(function(){
  //主页的事件绑定
  if(typeof(controller) != 'undefined' && controller == 'default') {
    $('.sidebar-nav a[href="#showRoute"]').click(function(e) {
      var routeId = $(this).attr('routeId');
      //routeId = +(routeId);
      loadARoute(routeId);
    }).on('shown', initMap);
  }
});
