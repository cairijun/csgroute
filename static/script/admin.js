function saveARoute() {
  //构建路径
  var _linePathToUpload = [];
  var _linePath = gLine.getPath();
  for(var i = 0 ; i < _linePath.getLength() ; i++) {
    _linePathToUpload.push(
      [
        _linePath.getAt(i).lat(),
        _linePath.getAt(i).lng()
    ]);
  }

  //构建锚点列表
  var _markersArrayToUpload = [];
  for(var i = 0 ; i < gMarkersArray.length ; i++) {
    //跳过已被删除的锚点
    if(gMarkersArray[i] == null) {
      continue;
    }
    _markersArrayToUpload.push({
      title : gMarkersArray[i].getTitle(),
      content : gMarkersArray[i].content,
      position : [
        gMarkersArray[i].getPosition().lat(),
        gMarkersArray[i].getPosition().lng()
      ]
    });
  }

  var _routeData = {
    line : {
      path : _linePathToUpload,
      strokeColor:"#f00",
      strokeWeight:3,
      strokeOpacity:0.5
    },
    markers : _markersArrayToUpload
  };

  //构建最终上传数据
  var _data = {
    routeData : JSON.stringify(_routeData),
    routeId : $('.btn-group-vertical button.active').attr('routeId')
  };

  $.post('?c=admin&a=ajax_save', _data, function(response) {
    responseObj = $.parseJSON(response);
    $('#save').popover({
      placement : 'bottom',
      trigger : 'manual',
      title : '保存线路',
      content : responseObj.content
    }).popover('show');
    window.setTimeout("$('#save').popover('hide')", 2000);

    if(_data.routeId.charAt(0) == '#') {
      $('.btn-group-vertical button.active').text(function(index, old) {
        return '编号：' + responseObj.routeId + '|名称：' + old;
      }).attr('routeId', responseObj.routeId);
    }
    else {
      $('.btn-group-vertical button.active').attr('routeId', responseObj.routeId);
    }

    setMode('normal');
  });
}

function addARoute() {
  var _routeName = $('#routeName').val();
  //向列表插入新线路（线路Id用`# + 线路名称`表示，后端会区分insert还是update）
  $('<button type="button" style="text-align: left;padding-left: 8px;" class="btn btn-block"></button>').
    attr('routeId', '#' + _routeName).
    text(_routeName).
    appendTo('.btn-group-vertical').
    button('toggle');
  regRoutesListEvents();//重新注册路线列表的事件

  clearMap();

  setMode('edit');

  gLine = new google.maps.Polyline({
    editable : true,
    map : map
  });
  regLineEvents(gLine);
  gInfoWindow = new google.maps.InfoWindow({});
}

function deleteARoute() {
  var _routeIdToDelete = $('.btn-group-vertical button.active').attr('routeId');
  $.post('?c=admin&a=ajax_delete', {routeId : _routeIdToDelete}, function(response) {
    if($.parseJSON(response).code == 0) {
      clearMap();
      $('.btn-group-vertical button.active').remove();
    }
  });
}

function regRoutesListEvents() {
  $('.btn-group-vertical button').off('.list').on('click.list', function() {
    var routeIdToGo = $(this).attr('routeId');
    var previousId = $('.btn-group-vertical button.active').attr('routeId');
    if($('#save').hasClass('disabled')) {
      loadARoute(routeIdToGo);
      setMode('normal');
    }
    else {
      callbackableModal('#tabModal', function() {
        loadARoute(routeIdToGo);
        setMode('normal');
        $('#tabModal').modal('hide');
      }, function() {
        $('.btn-group-vertical button[routeId="' + previousId + '"]').button('toggle');
      });
    }
  });
}

function regToolbarEvents() {
  $('#save').click(saveARoute);

  $('#reset').click(function() {
    loadARoute($('.btn-group-vertical button.active').attr('routeId'), true);
  });

  $('#edit').click(function() {
    setMode('edit');
  });

  //插入和删除的动作不直接绑定到工具栏按钮的click上，而是绑定到popover的确认按钮上
  var addPopoverDialog = '\
  <input id="routeName" class="input-block-level" type="text" placeholder="线路名称">\
  <a href="javascript:addARoute();$(\'#add\').popover(\'hide\');" class="btn btn-primary">确定</a>\
  <a href="javascript:$(\'#add\').popover(\'hide\');" class="btn">取消</a>';
  $('#add').popover({
    html : true,
    placement : 'bottom',
    title : '添加线路',
    content : addPopoverDialog
  });

  var deletePopoverDialog = '\
  <p class="text-error">确定要删除这条线路吗？</p>\
  <a href="javascript:deleteARoute();$(\'#delete\').popover(\'hide\');" class="btn">确定</a>\
  <a href="javascript:$(\'#delete\').popover(\'hide\');" class="btn btn-primary">取消</a>';
  $('#delete').popover({
    html : true,
    placement : 'bottom',
    title : '删除线路',
    content : deletePopoverDialog
  });
}

function callbackableModal(elementSelector, callback, callback2) {
  //定义一个可异步回调的Bootstrap弹出层调用函数
  $(elementSelector + ' .modal-footer .btn-primary').
    off('click.modal').
    one('click.modal',callback);
  $(elementSelector + ' button[aria-hidden]').
    off('click.modal').
    one('click.modal',callback2);
  $(elementSelector).one('show', function() {
    $(elementSelector + ' input,' + elementSelector + ' textarea').val('');
  }).modal('show');
}

function regMapEvents() {
  google.maps.event.addListener(map, 'click', function(e) {
    //单击为插入
    //地图事件只在添加模式下响应
    if(gAddMode) {
      if($('#addGroup #route').hasClass('active')) {
        //线路插入模式
        gLine.getPath().push(e.latLng);
      }
      else {
        //锚点插入模式
        var _marker = new google.maps.Marker({
          draggable : true,
          position : e.latLng,
          map : map
        });
        //延迟500毫秒后弹出锚点信息编辑框
        window.setTimeout(function() {
          callbackableModal('#addMarkerModal', function() {
            _marker.setTitle($('#markerTitle').val());
            _marker.content = $('#markerContent').val();
            _marker.index = gMarkersArray.length;
            gMarkersArray.push(_marker);
            regMarkerEvents(_marker);
            $('#addMarkerModal').modal('hide');
          }, function() {
            _marker.setMap(null);
            _marker = null;
          });
        }, 500);
      }
    }
  });

  //线路和锚点的事件处理应在创建对象时绑定
}

function setToolbarStatus(status) {
  if(status == 'edit') {
    $('#mainGroup button').removeClass('disabled');
    $('#editGroup button').addClass('disabled');
    $('#addGroup button').removeClass('disabled');
  }
  if(status == 'normal') {
    $('#mainGroup button').addClass('disabled');
    $('#editGroup button').removeClass('disabled');
    $('#addGroup button').addClass('disabled');
  }
}

function setMode(mode) {
  setToolbarStatus(mode);
  if(mode == 'edit') {
    gAddMode = true;
    if(gLine) {
      gLine.setEditable(true);
    }
    if(gMarkersArray.length != 0) {
      for(var i = 0 ; i < gMarkersArray.length ; i++) {
        gMarkersArray[i].setDraggable(true);
      }
    }
  }
  if(mode == 'normal') {
    gAddMode = false;
    if(gLine) {
      gLine.setEditable(false);
    }
    if(gMarkersArray.length != 0) {
      for(var i = 0 ; i < gMarkersArray.length ; i++) {
        gMarkersArray[i].setDraggable(false);
      }
    }
  }
}


$(document).ready(function() {
  if(typeof(controller) != 'undefined' && controller == 'admin') {
    function adminInit() {
      if(typeof(isAdminInit) == 'undefined' || !isAdminInit) {
        initMap();
        regRoutesListEvents();
        regToolbarEvents();
        regMapEvents();
        gAddMode = false;
        var isAdminInit = true;
      }
    }
    $('a[href="#routesAdmin"]').on('shown', adminInit);
  }
});
