//地图初始化
function initMap(container) {
  if(typeof(map) == 'undefined' || map == null) {
    var centerLatLng = new google.maps.LatLng(23.019762029727456,113.12095664572846);
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
    gLocatorControl = new LocatorControl(map);
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(gLocatorControl.getDomElement());
    gLine = null;
    gMarkersArray = [];
    gInfoWindow = null;
    gCyanMarkerIconI = getCyanMarkerIcon(false);
    gCyanMarkerIconS = getCyanMarkerIcon(true);
  }
  else
    google.maps.event.trigger(map, 'resize');
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
    var lineName = gLine.name;//保存原线路的名称
    clearMap();//如果是新建线路，直接清除地图
    gLine = new google.maps.Polyline({
      editable : true,
      map : map,
      strokeColor : color
    });
    gLine.id = '#';
    gLine.name = lineName;
    google.maps.event.addListener(gLine, 'rightclick', function(e) {
      if(gAddMode && ('vertex' in e)) {
        gLine.getPath().removeAt(e.vertex);
      }
    });
    gInfoWindow = new google.maps.InfoWindow({});
    return true;
  }
  $.get('?c=default&a=ajax_getroutes&route_id=' + routeId, function(d) {
    var data = parseEncryptedData(d);
    var line = data[0].line;
    line.name = data[0].name;
    line.id = data[0].id;
    var markers = data[0].markers;

    //加载地图的状态
    if(typeof(data[0].status) != 'undefined' && data[0].status != null) {
      var center = data[0].status.center;
      var zoom = data[0].status.zoom;
      if(typeof(center) != 'undefined' && center != null) {
        var centerPoint = new google.maps.LatLng(center[0], center[1]);
        map.setCenter(centerPoint);
      }
      if(typeof(zoom) != 'undefined' && zoom != null) {
        map.setZoom(zoom);
      }
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
  //下载修正数据库
  if(window.localStorage.getItem('ERROR_DB') == null) {
    $.get('./static/error_db.json', function(data) {
      gErrorDb = data;
      window.localStorage.setItem('ERROR_DB', JSON.stringify(data));
    });
  }
  else {
    gErrorDb = $.parseJSON(window.localStorage.getItem('ERROR_DB'));
  }
  //主页的事件绑定
  if(typeof(controller) != 'undefined' && controller == 'default') {

    gHideSide = false;

    $('.sidebar-nav a[href="#showRoute"]').click(function(e) {
      var routeId = $(this).attr('routeId');
      //routeId = +(routeId);
      loadARoute(routeId);

      //隐藏侧边栏时，点击线路后收起侧边栏
      if(gHideSide) {
        var sideWidth = $('.container-fluid div.span3').width();
        $('.container-fluid div.span3').animate(
          {left:-sideWidth},
          'fast');
      }
    }).on('shown', initMap);

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

    //响应式设计事件
    $(window).resize(onWindowResize);
    onWindowResize();
  }
});

//首页搜索框事件处理程序
function searchEventHandler() {
  var keyword = $('#searchInput').val();
  var selectorHide = 'li.routesListLi a:not(:contains(' + keyword + '))';
  var selectorShow = 'li.routesListLi a:contains(' + keyword + ')';
  $(selectorHide).fadeOut('fast');
  $(selectorShow).fadeIn('fast');
}

//窗口尺寸变更事件，ready时会触发
function onWindowResize() {
  if($('.visible-phone').css('display') != 'none') {
    //手机上自动收起侧边栏
    if(!gHideSide)
      toggleSide();
  }
}

//控制侧边栏
function toggleSide() {
  if(!gHideSide) {//隐藏侧边栏
    $('.container-fluid div.span9').removeClass('span9').addClass('span11');
    $('#toggleSideIcon').removeClass('icon-chevron-left').addClass('icon-chevron-right');

    $('.container-fluid div.span3').
      css('position', 'absolute').
      animate({left: -$('.container-fluid div.span3').width()}, 400,
              function() {
                if(typeof(map) != 'undefined' && map != null)
                  google.maps.event.trigger(map, 'resize');

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
};

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

  var _this = this;
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

function LocatorControl(map) {
  this._map = map;
  this._isEnabled = false;
  this._isUsable = true;
  var div = document.createElement('div');
  div.style.border = '1px solid';
  div.style.backgroundColor = 'white';
  div.style.padding = '3px';
  div.style.position = 'absolute';
  div.style.boxShadow = '2px 2px 4px #000';
  div.style.width = 'auto';
  div.style.margin = '5px';
  div.innerHTML = '定位停止';
  this._div = div;
  var _this = this;

  if("geolocation" in navigator) {
    this._initOverlay();
  }
  else {
    this._div.innerHTML = '此浏览器不支持定位';
    this._isUsable = false;
  }

  google.maps.event.addDomListener(this._div, 'contextmenu', function(e) {
    if(_this.isLocateByInput)
      return;
    e.preventDefault();
    _this.isLocateByInput = true;
    var inputForm = '\
<form id="latLngForm">\
<input type="text" placeholder="纬度" id="lat">\
<input type="text" placeholder="经度" id="lng">\
<button type="submit">定位</button>\
<button type="button" id="latLngCancel">取消</button>\
</form>';
    var inputFormObj = $.parseHTML(inputForm);
    $(inputFormObj).click(function(e) {e.stopPropagation();});
    $(this).append(inputFormObj);
    $('#latLngForm input').css('width', '55pt').css('display', 'block');
    $('#latLngForm').css('margin', '0px').submit(function(e) {
      e.preventDefault();
      if($('#lat').val().match(/[^\d.]/) != null) {
        $('#lat').val('').focus();
        return;
      }
      if($('#lng').val().match(/[^\d.]/) != null) {
        $('#lng').val('').focus();
        return;
      }
      pObj = {coords: {latitude: +$('#lat').val(), longitude: +$('#lng').val(), accuracy: 0}};
      _this.updatePosition(pObj);
      $(inputFormObj).remove();
      _this.isLocateByInput = false;
    });
    $('#latLngCancel').click(function(e) {
      e.stopPropagation();
      $(inputFormObj).remove();
      _this.isLocateByInput = false;
    });
  });

  google.maps.event.addDomListener(this._div, 'click', function() {
    if(_this.isLocateByInput)
      return;
    if(!_this._isUsable)
      return;
    if(_this._isEnabled) {
      navigator.geolocation.clearWatch(_this._watchId);
      _this._div.innerHTML = '定位停止';
      _this._isEnabled = false;
    }
    else {
      _this._div.innerHTML = '定位中……';
      _this._isEnabled = true;
      _this._watchId = navigator.geolocation.watchPosition(
        function(p) {
        _this.updatePosition(p);
      },
      function(e) {
        _this._div.innerHTML = '定位失败';
        _this._isEnabled = false;
      },
      {enableHighAccuracy: true}
      );
    }
  });
};

LocatorControl.prototype.getDomElement = function() {
  return this._div;
};

LocatorControl.prototype.updatePosition = function(p) {
  var lat = p.coords.latitude;
  var lng = p.coords.longitude;
  var acr = p.coords.accuracy;
  var mapTypeId = this._map.getMapTypeId();
  if(mapTypeId != 'satellite' && mapTypeId != 'hybrid') {
    //偏移修正
    var deltaLat = (lat - gErrorDb.lat0) / 0.01;
    var deltaLng = (lng - gErrorDb.lng0) / 0.01;
    var latIndex = Math.round(deltaLat);
    var lngIndex = Math.round(deltaLng);
    var ratLat = deltaLat - latIndex;
    var ratLng = deltaLng - lngIndex;
    if(latIndex >= 0 && lngIndex >=0 && latIndex < gErrorDb.data.length - 1 && lngIndex < gErrorDb.data.length - 1) {
      var offset = gErrorDb.data[latIndex][lngIndex];
      lat += offset[0];
      lng += offset[1];
      acr += 30;
    }
  }
  var pos = new google.maps.LatLng(lat, lng);
  this._marker.setPosition(pos);
  this._circle.setCenter(pos);
  this._circle.setRadius(acr);
  this._map.setCenter(pos);
  this._div.innerHTML = '定位成功';
};

LocatorControl.prototype._initOverlay = function() {
  var _markerIcon = new google.maps.MarkerImage('./static/image/bullet_blue.png');
  _markerIcon.anchor = new google.maps.Point(16, 16);

  this._marker = new google.maps.Marker({flat: true, icon: _markerIcon, map: this._map, clickable: false});
  this._circle = new google.maps.Circle({
    fillColor: '#0AF', fillOpacity: 0.25, strokeColor: '#0AF', strokeWeight: 1.5, clickable: false, map: this._map
  });
};

LocatorControl.prototype._destroyOverlay = function() {
  if(this._marker)
    this._marker.setMap(null);
  if(this._circle)
    this._circle.setMap(null);
  this._marker = null;
  this._circle = null;
}
