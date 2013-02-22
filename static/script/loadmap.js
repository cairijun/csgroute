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
    map = new google.maps.Map(document.getElementById(container), options);
    if(typeof(controller) != 'undefined' && controller == 'default') {
      //测距功能按键与管理页面冲突，所以只在查看页面加载
      gRuleControl = new RuleControl(map);
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(gRuleControl.getDomElement());
    }
    gLine = null;
    gMarkersArray = [];
    gInfoWindow = null;
    gCyanMarkerIconI = getCyanMarkerIcon(false);
    gCyanMarkerIconS = getCyanMarkerIcon(true);
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
        gMarkersArray[i].label.setMap(null);
        gMarkersArray[i].label = null;
      }
    }
    gMarkersArray.length = 0;
  }

  if(gInfoWindow) {
    gInfoWindow = null;
  }
}

//获取青色Marker的ICON
function getCyanMarkerIcon(isShadow) {
  var icon = new google.maps.MarkerImage('./static/image/marker_sprite2.png');
  if(isShadow) {
    //阴影ICON
    icon.size = new google.maps.Size(37, 34);
    icon.origin = new google.maps.Point(20, 0);
    icon.anchor = new google.maps.Point(10, 34);
  }
  else {
    //非阴影ICON
    icon.size = new google.maps.Size(20, 34);
    icon.origin = new google.maps.Point(0, 0);
    icon.anchor = new google.maps.Point(10, 34);
  }
  return icon;
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
  gLine.name = line.name;
  gLine.id = line.id;
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
    if(typeof(markers[i].color) != 'undefined' && markers[i].color == 'cyan') {
      _marker.setIcon(gCyanMarkerIconI);
      _marker.setShadow(gCyanMarkerIconS);
      _marker.color = markers[i].color;
    }
    _marker.content = markers[i].content;
    var _label = new MarkerLabel(_marker.getPosition(), _marker.getTitle(), map);
    _marker.label = _label;
    regMarkerEvents(_marker);
    _marker.index = gMarkersArray.length;
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
        this.label.setMap(null);
        gMarkersArray[this.index] = null;
      }
    }
  );
  //拖动时更新Label位置
  google.maps.event.addListener(
    marker, 'drag',
    function(e) {
      if(gAddMode) {
        this.label.setPosition(e.latLng);
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
  if(routeId == '#') {
    var color = gLine.strokeColor;//保存原线路颜色
    clearMap();//如果是新建线路，直接清除地图
    gLine = new google.maps.Polyline({
      editable : true,
      map : map,
      strokeColor : color
    });
    google.maps.event.addListener(gLine, 'rightclick', function(e) {
      if(gAddMode && ('vertex' in e)) {
        gLine.getPath().removeAt(e.vertex);
      }
    });
    gInfoWindow = new google.maps.InfoWindow({});
    return true;
  }
  getKey();
  $.get('?c=default&a=ajax_getroutes&route_id=' + routeId, function(d) {
    var data = parseEncryptedData(d);
    var line = data[0].line;
    line.name = data[0].name;
    line.id = data[0].id;
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
    if(admin) {
      gAddMode = true;
      //如果修改过属性，重置时列表可能不能及时恢复，所以要强制更新一下
      $('.btn-group-vertical button.active').
        text(gLine.name).
        data('name', gLine.name);
    }
    else
      gAddMode = false;
  }).
    error(function() {
    //$('#authErrorModal').modal('toggle');
    showErrorModal('当前登录已失效，请重新登录再试。');
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

    gHideSide = false;

    $('#showSide').mouseenter(function() {
      if(gHideSide) {
        $('.container-fluid div.span3').animate(
          {left:0},
          'fast');
      }
    });

    $('.container-fluid div.span3').mouseleave(function() {
      if(gHideSide) {
        var sideWidth = $('.container-fluid div.span3').width();
        $('.container-fluid div.span3').animate(
          {left:-sideWidth},
          'fast');
      }
    });

    $('#searchInput').keyup(searchEventHandler);
  }
});

//首页搜索框事件处理程序
function searchEventHandler() {
  var keyword = $('#searchInput').val();
  var selectorHide = 'li.routesListLi a:not(:contains("' + keyword + '"))';
  var selectorShow = 'li.routesListLi a:contains("' + keyword + '")';
  $(selectorHide).fadeOut('fast');
  $(selectorShow).fadeIn('fast');
}

//控制侧边栏
function toggleSide() {
  if(!gHideSide) {//隐藏侧边栏
    $('.container-fluid div.span9').removeClass('span9').addClass('span11');
    $('#toggleSideIcon').removeClass('icon-chevron-left').addClass('icon-chevron-right');

    if(typeof(map) != 'undefined' && map != null)
      google.maps.event.trigger(map, 'resize');

    $('.container-fluid div.span3').
      css('position', 'absolute').
      animate({left: -$('.container-fluid div.span3').width()}, 400,
              function() {
                $('#showSide').removeClass('hide');
                gHideSide = true;
              }
             );
  }
  else {//显示侧边栏
    $('.container-fluid div.span11').removeClass('span11').addClass('span9');
    $('#toggleSideIcon').removeClass('icon-chevron-right').addClass('icon-chevron-left');

    if(typeof(map) != 'undefined' && map != null)
      google.maps.event.trigger(map, 'resize');

    $('.container-fluid div.span3').css('position', 'static');
    $('#showSide').addClass('hide');
    gHideSide = false;
  }
}

//自定义一个MarkerLabel叠加层
function MarkerLabel(position, label, map) {
  this._position = position;
  this._label = label;
  this._map = map;
  this._div = null;
  this.setMap(map);
};

MarkerLabel.prototype = new google.maps.OverlayView();

MarkerLabel.prototype.onAdd = function() {
  var div = document.createElement('DIV');
  div.style.border = '1px solid';
  div.style.backgroundColor = 'white';
  div.style.padding = '2px';
  div.style.position = 'absolute';
  div.style.boxShadow = '2px 2px 4px #000';
  div.style.whiteSpace = 'nowrap';
  div.appendChild(document.createTextNode(this._label));

  this._div = div;
  var panes = this.getPanes();
  panes.overlayLayer.appendChild(div);
};

MarkerLabel.prototype.draw = function() {
  var overlayProjection = this.getProjection();
  var pos = overlayProjection.fromLatLngToDivPixel(this._position);
  var div = this._div;
  div.style.left = pos.x + 'px';
  div.style.top = pos.y + 'px';
};

MarkerLabel.prototype.onRemove = function() {
  this._div.parentNode.removeChild(this._div);
  this._div = null;
};

MarkerLabel.prototype.setPosition = function(pos) {
  this._position = pos;
  this.draw();
}

//自定一个RuleControl控件用于测距
function RuleControl(map) {
  this._map = map;
  var div = document.createElement('div');
  div.style.border = '1px solid';
  div.style.backgroundColor = 'white';
  div.style.padding = '3px';
  div.style.position = 'absolute';
  div.style.boxShadow = '2px 2px 4px #000';
  div.style.width = 'auto';
  div.style.margin = '5px';
  div.innerHTML = '测距：0 km';
  this._div = div;
  this._line = new google.maps.Polyline({editable:true, geodesic:true, map:map, strokeWeight:2});

  _this = this;
  google.maps.event.addListener(map, 'click', function(e) {
    _this._line.getPath().push(e.latLng);
  });
  google.maps.event.addListener(_this._line, 'rightclick', function(e) {
    if(typeof(e.vertex) != 'undefined') {
      _this._line.getPath().removeAt(e.vertex);
    }
  });
  //把添加和修改路径节点的事件处理程序绑定到路径节点数组中（直接绑定到_line中有优先级问题）
  google.maps.event.addListener(_this._line.getPath(), 'insert_at', function() {
    _this.getDistance();
  });
  google.maps.event.addListener(_this._line.getPath(), 'set_at', function() {
    _this.getDistance();
  });
  google.maps.event.addListener(_this._line.getPath(), 'remove_at', function() {
    _this.getDistance();
  });
  google.maps.event.addDomListener(_this._div, 'click', function() {
    _this._line.getPath().clear();
    _this._div.innerHTML = '测距：0 km';
  });
};

RuleControl.prototype.getDomElement = function() {
  return this._div;
};

//计算路径长度并把结果显示到Rule控件上
RuleControl.prototype.getDistance = function() {
  var path = this._line.getPath();
  var length = 0.0;
  var R = 637813.7;
  for(var i = 1; i < path.getLength(); i++) {
    var _latlng0 = path.getAt(i - 1);
    var _latlng1 = path.getAt(i);
    var rLat0 = _latlng0.lat() * Math.PI / 180;
    var rLat1 = _latlng1.lat() * Math.PI / 180;
    var dRLng = (_latlng0.lng() - _latlng1.lng()) * Math.PI / 180;
    var cosA =
      Math.sin(rLat0) * Math.sin(rLat1) +
      Math.cos(rLat0) * Math.cos(rLat1) * Math.cos(dRLng);
    length += R * Math.acos(cosA);
  }
  length = Math.round(length) / 100;
  this._div.innerHTML = '测距：' + length + ' km';
};
