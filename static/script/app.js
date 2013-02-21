$(document).ready(function() {
  $('#loginform').submit(function(e) {
    e.preventDefault();
    var password = $('#password').val();
    var _passhash = get_pass_hash(password, $('#username').val());
    $.post(
      '?c=app&a=ajax_login',
      {
        username: $('#username').val(),
        passhash: _passhash + ''
      },
      function(d) {
        var ret = JSON.parse(d);
        if(ret.errno == 0) {
          $('.dropdown span').text(ret.msg);
          $('#loginform').addClass('navbar-hide');
          $('#usermenu').removeClass('navbar-hide');
        }
        else {
          $('#loginform button').popover(
            {placement:'bottom', trigger:'manual', title:'错误', content:ret.msg}).
            popover('show');
            window.setTimeout("$('#loginform button').popover('hide')", 2000);
        }
      }
    );
  });

  $('#changePasswordModal').on('hide', function(){$('#alertContainer .alert').remove();});
});

function get_pass_hash(password, username) {
    var _passhash = CryptoJS.SHA1(password);
    _passhash = CryptoJS.SHA1(username + _passhash);
    _passhash = CryptoJS.SHA1(password + _passhash);
    return _passhash + '';
}

function logout() {
  $.get(
    '?c=app&a=ajax_logout',
    function() {
      $('#usermenu').addClass('navbar-hide');
      $('#loginform').removeClass('navbar-hide');
    }
  );
}

function change_password() {
  $('#changePasswordModal input').val('');
  $('#changePasswordModal').modal('toggle');
}

function post_new_password() {
  var inconsistentAlert = '\
  <div id="inconsistentAlert" class="alert alert-error fade in">\
  <button type="button" class="close" data-dismiss="alert">&times;</button>\
  <strong>错误！</strong>新密码两次输入不一致。\
  </div>';
  var oldpasswordAlert = '\
  <div id="oldPasswordAlert" class="alert alert-error fade in">\
  <button type="button" class="close" data-dismiss="alert">&times;</button>\
  <strong>错误！</strong>旧密码输入错误。\
  </div>';
  var successAlert = '\
  <div id="successAlert" class="alert alert-success fade in">\
  <button type="button" class="close" data-dismiss="alert">&times;</button>\
  <strong>修改成功！</strong>请重新登录。\
  </div>';

  $('#alertContainer .alert').alert('close');
  if($('#newpassword').val() != $('#repeatpassword').val()) {
    $(inconsistentAlert).appendTo('#alertContainer');
    $('#newpassword').focus();
  }
  else {
    $.post(
      '?c=app&a=ajax_change_password',
      {
        oldpasshash:get_pass_hash($('#oldpassword').val(), $('.dropdown span').text()),
        newpasshash:get_pass_hash($('#newpassword').val(), $('.dropdown span').text())
      },
      function(d) {
        var ret = $.parseJSON(d);
        if(ret.errno == 0) {
          $(successAlert).appendTo('#alertContainer');
          setTimeout("$('#changePasswordModal').modal('hide');", 1500);
          $('#usermenu').addClass('navbar-hide');
          $('#loginform').removeClass('navbar-hide');
        }
        else if(ret.errno == -1) {
          $(oldpasswordAlert).appendTo('#alertContainer');
          $('#oldpassword').val('').focus();
        }
      }
    );
  }
}

function xssf(data) {
  return data.replace(/[&\"<>]/g, function(c) {
    switch(c) {
      case '&':
        return '&amp;';
      case '"':
        return '&quot;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
    }
  });
}

function showErrorModal(msg) {
  $('#modalErrorMsg').text(msg);
  $('#errorModal').modal('show');
}
