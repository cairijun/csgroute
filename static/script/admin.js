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
      color : gMarkersArray[i].color,
      position : [
        gMarkersArray[i].getPosition().lat(),
        gMarkersArray[i].getPosition().lng()
      ]
    });
  }

  var _routeData = {
    line : {
      path : _linePathToUpload,
      strokeWeight:3,
      strokeColor:gLine.strokeColor,
      strokeOpacity:1.0
    },
    markers : _markersArrayToUpload
  };

  //构建最终上传数据
  var _data = {
    routeData : JSON.stringify(_routeData),
    routeId : gLine.id,
    routeName : gLine.name
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

    if(_data.routeId == '#') {
      $('.btn-group-vertical button.active').
        data('id', responseObj.routeId);
      gLine.id = responseObj.routeId;
    }
    else {
      $('.btn-group-vertical button.active').data('id', responseObj.routeId);
    }

    setMode('normal');
  }).
    fail(function() {
    //$('#authErrorModal').modal('toggle');
    showErrorModal('当前登录已失效或您无权进行此操作，请重新登录再试。');
  });
}

function addARoute() {
  var _routeName = $('#routeName').val();
  //向列表插入新线路（线路Id用`# + 线路名称`表示，后端会区分insert还是update）
  $('<button type="button" style="text-align: left;padding-left: 8px;" class="btn btn-block"></button>').
    data('id', '#' + _routeName).
    text(_routeName).
    appendTo('.btn-group-vertical').
    button('toggle');
  regRoutesListEvents();//重新注册路线列表的事件

  clearMap();

  setMode('edit');

  gLine = new google.maps.Polyline({
    editable : true,
    strokeColor : $('#routeType .active').data('color'),
    map : map
  });
  gLine.name = _routeName;
  gLine.id = '#';
  regLineEvents(gLine);
  gInfoWindow = new google.maps.InfoWindow({});
}

function deleteARoute() {
  //var _routeIdToDelete = $('.btn-group-vertical button.active').data('id');
  var _routeIdToDelete = gLine.id;
  $.post('?c=admin&a=ajax_delete', {routeId : _routeIdToDelete}, function(response) {
    if($.parseJSON(response).code == 0) {
      clearMap();
      $('.btn-group-vertical button.active').remove();
    }
  }).
    fail(function() {
    //$('#authErrorModal').modal('toggle');
    showErrorModal('当前登录已失效或您无权进行此操作，请重新登录再试。');
  });
}

function editProperties() {
  var _routeName = $('#routeName').val();
  var _color = $('#routeType .active').data('color');
  gLine.setOptions({strokeColor : _color});
  gLine.name = _routeName;
  $('.btn-group-vertical button.active').
    data('name', _routeName).
    text(_routeName);
}

function regRoutesListEvents() {
  $('.btn-group-vertical button').off('.list').on('click.list', function() {
    var routeIdToGo = $(this).data('id');
    var previousId = $('.btn-group-vertical button.active').data('id');
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
  $('#save').click(function() {
    if(!$(this).hasClass('disabled'))
      saveARoute();
  });

  $('#reset').click(function() {
    if(!$(this).hasClass('disabled'))
      loadARoute(gLine.id, true);
  });

  $('#edit').click(function() {
    if(!$(this).hasClass('disabled') && typeof(gLine) != 'undefined' && gLine != null)
      setMode('edit');
  });

  var propertiesDialogCommon = '\
  <input id="routeName" class="input-block-level" type="text" placeholder="线路名称">\
  <div id="routeType" class="btn-group" style="margin:0px 0px 10px" data-toggle="buttons-radio">\
    <button data-color="red" class="btn btn-small btn-danger active">管道光缆</button>\
    <button data-color="green" class="btn btn-small btn-success">架空ADSS</button>\
    <button data-color="yellow" class="btn btn-small btn-warning">架空OPGW</button>\
  </div>';

  //修改属性对话框
  var propertiesPopoverDialog = propertiesDialogCommon + '\
  <a href="javascript:editProperties();$(\'#properties\').popover(\'hide\');" class="btn btn-primary">确定</a>\
  <a href="javascript:$(\'#properties\').popover(\'hide\');" class="btn">取消</a>';
  $('#properties').popover({
    html : true,
    placement : 'bottom',
    title : '修改属性',
    content : propertiesPopoverDialog,
    trigger : 'manual'
  }).click(function() {
    if(!$(this).hasClass('disabled')) {
      $(this).popover('show');
      $('#mainGroup .popover').css('width', 'auto');
      var originColor = gLine.strokeColor;
      $('#routeType button[data-color="' + originColor + '"]').button('toggle');
      $('#routeName').val(gLine.name);
    }
  });

  //插入和删除的动作不直接绑定到工具栏按钮的click上，而是绑定到popover的确认按钮上
  var addPopoverDialog = propertiesDialogCommon + '\
  <a href="javascript:addARoute();$(\'#add\').popover(\'hide\');" class="btn btn-primary">确定</a>\
  <a href="javascript:$(\'#add\').popover(\'hide\');" class="btn">取消</a>';
  $('#add').popover({
    html : true,
    placement : 'bottom',
    title : '添加线路',
    content : addPopoverDialog,
    trigger : 'manual'
  }).click(function() {
    if(!$(this).hasClass('disabled')) {
      $(this).popover('show');
      $('#editGroup .popover').css('width', 'auto');
    }
  });//修正弹出框的宽度

  var deletePopoverDialog = '\
  <p class="text-error">确定要删除这条线路吗？</p>\
  <a href="javascript:deleteARoute();$(\'#delete\').popover(\'hide\');" class="btn">确定</a>\
  <a href="javascript:$(\'#delete\').popover(\'hide\');" class="btn btn-primary">取消</a>';
  $('#delete').popover({
    html : true,
    placement : 'bottom',
    title : '删除线路',
    content : deletePopoverDialog,
    trigger : 'manual'
  }).click(function() {
    if(!$(this).hasClass('disabled') && typeof(gLine) != 'undefined' && gLine != null)
      $(this).popover('show');
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
 
            //创建对应的Label
            _marker.label = new MarkerLabel(_marker.getPosition(), _marker.getTitle(), map);

            //设置Marker颜色
            _marker.color = $('#markerType .active').data('color');
            if(_marker.color == 'cyan') {
              _marker.setIcon(gCyanMarkerIconI); 
              _marker.setShadow(gCyanMarkerIconS); 
            }

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
      	if(gMarkersArray[i] != null)
          gMarkersArray[i].setDraggable(false);
      }
    }
  }
}

//注册用户管理页面的事件
function regUserAdminEvent() {
  $('table .btn-group button.btn-danger').click(function() {
    var userid = $(this).data('userid');
    var popover = '\
    <p class="text-error">您确认要删除这个用户吗？</p>\
    <a href="javascript:delete_a_user_event_handler(\'' + userid + '\', true)" class="btn">确定</a>\
    <a href="javascript:delete_a_user_event_handler(\'' + userid + '\', false)" class="btn btn-primary">取消</a>\
    ';
    $(this).
      popover({html:true, placement:'bottom', trigger:'manual', title:'确认', content:popover}).
      popover('show');
  });

  var popover = '\
  <input id="newUsername" class="input-block-level" type="text" placeholder="用户名">\
  <input id="newUserPassword" class="input-block-level" type="password" placeholder="密码">\
  <input id="repeatPassword" class="input-block-level" type="password" placeholder="确认密码">\
  <div id="newUserPermissions" class="btn-group" style="margin:0px 0px 10px; display: block;" data-toggle="buttons-radio">\
  <button data-permissions="10" class="btn btn-mini active">查看线路</button>\
  <button data-permissions="5" class="btn btn-mini btn-warning">修改线路</button>\
  </div>\
  <a href="javascript:addAUser();" class="btn btn-primary">确定</a>\
  <a href="javascript:$(\'#addUser\').popover(\'hide\');" class="btn">取消</a>';
  $('#addUser').popover({
    html: true,
    placement: 'bottom',
    title: '添加用户',
    content: popover
  });
}

function delete_a_user_event_handler(userid, ensure) {
  if(ensure) {
    $.post('?c=admin&a=ajax_delete_a_user', {userid:userid}, function(d) {
      var data = $.parseJSON(d);
      if(data.errno != 0) {
        showErrorModal(data.msg);
      }
      else {
        $('table tr[data-userid="' + userid + '"]').remove();
        regUserAdminEvent();
      }
    }).fail(function() {
      $('#addUser').popover('hide');
      showErrorModal('当前登录已失效或您无权进行此操作，请重新登录再试。');
    });
  }
  $('table button.btn-danger[data-userid="' + userid + '"]').popover('hide');
}

function addAUser() {
  var username = $('#newUsername').val();
  var password = $('#newUserPassword').val();
  if(password != $('#repeatPassword').val()) {
    $('#repeatPassword').val('').focus();
    return;
  }
  var permissions = $('#newUserPermissions .active').data('permissions');
  var passhash = get_pass_hash(password, username);
  $.post(
    '?c=admin&a=ajax_add_a_user',
    {
      username: username,
      passhash: passhash,
      permissions: permissions
    },
    function(d) {
      var data = $.parseJSON(d);
      if(data.errno != 0) {
        $('#addUser').popover('hide');
        showErrorModal(data.msg);
        return;
      }
      var newid = data.msg;
      var permissions_color = permissions < 10 ? ' class="warning"' : '';
      var permissions_str = permissions < 10 ? '修改线路' : '查看线路';
      var newUserRow = '\
      <tr' + permissions_color + ' data-userid="' + newid + '">\
      <td>' + newid + '</td>\
      <td>' + xssf(username) + '</td>\
      <td>' + permissions_str + '</td>\
      <td>\
      <div class="btn-group">\
      <button class="btn btn-danger btn-mini" data-userid="' + newid + '">删除用户</button>\
      </div>\
      </td>\
      </tr>';
      $(newUserRow).appendTo('#usersAdmin tbody');
      regUserAdminEvent();
      $('#addUser').popover('hide');
    }
  ).fail(function() {
    $('#addUser').popover('hide');
    showErrorModal('当前登录已失效或您无权进行此操作，请重新登录再试。');
  });
}

function adminSearchEventHandler() {
  var keyword = $('#searchInput').val();
  var selectorHide = 'div.btn-group-vertical button:not(:contains("' + keyword + '"))';
  var selectorShow = 'div.btn-group-vertical button:contains("' + keyword + '")';
  $(selectorHide).fadeOut('fast');
  $(selectorShow).fadeIn('fast');
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
    regUserAdminEvent();

    $('#searchInput').keyup(adminSearchEventHandler);
  }
});
