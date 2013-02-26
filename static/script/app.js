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
          if(typeof(page) != 'undefined') {
            if(page == 'info') {
              location.reload();
              return;
            }
          }
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

//获取加密传输用密钥
function getKey() {
  var key = window.sessionStorage.getItem('KEY');
  if(key == null) {
    //sessionStorage中没有密钥，生成一个新的并通知服务器
    key = CryptoJS.lib.WordArray.random(24).toString(CryptoJS.enc.Base64);
    $.post(
      '?c=app&a=ajax_set_key',
      {
        key : rsaEncrypt(key)
      },
      function(data) {
        responseObj = $.parseJSON(data);
        if(responseObj.code != 0)
          return false;
        else
          window.sessionStorage.setItem('KEY', key);
      }
    );
  }
  return key;
}

//用RSA公钥加密数据
function rsaEncrypt(data) {
  var modulus = 'D5941D31993E3F792362C405FCDA1E856AA1062B667F88DB70D2ADF9BC6324DABDB3720897A482F2A1482095B05C9E5D592AA205714E3CF85C568FAAF8AC43FE1A56A1CE18976041408FA9C84435F3FF163451E7EB95AF21606D58E6937356F0ABA3D08EC68655732EB850217A02ABB22357D0AFEB922C358F22853CEAACA799';
  var publicE = '10001';
  var rsaObj = new RSAKey();
  rsaObj.setPublic(modulus, publicE);
  var hexData = rsaObj.encrypt(data);
  return CryptoJS.enc.Hex.parse(hexData).toString(CryptoJS.enc.Base64);
}

//加密数据
function encryptedData(data) {
  var ivStr = CryptoJS.enc.Base64.stringify(CryptoJS.lib.WordArray.random(12));
  var key = CryptoJS.enc.Latin1.parse(getKey());
  var encryptedData = CryptoJS.AES.encrypt(
    data, key,
    {
      padding: CryptoJS.pad.ZeroPadding,
      iv: CryptoJS.enc.Latin1.parse(ivStr),
      mode: CryptoJS.mode.CBC
    }
  );
  return ivStr + encryptedData.toString();
}

//解密服务器中返回的加密数据并解析成对象
function parseEncryptedData(data) {
  //返回数据的前16个字符为IV
  var ivStr = data.substr(0, 16);
  var dataStr = data.substr(16);
  var iv = CryptoJS.enc.Latin1.parse(ivStr);
  var key = CryptoJS.enc.Latin1.parse(getKey());
  var originalData = CryptoJS.AES.decrypt(
    dataStr, key,
    {
      padding: CryptoJS.pad.ZeroPadding,
      iv: iv,
      mode: CryptoJS.mode.CBC
    }
  );
  return $.parseJSON(originalData.toString(CryptoJS.enc.Utf8));
}

//加密POST数据
function encryptedPost(url, data, success, fail) {
  var dataToPostStr = JSON.stringify(data);
  $.post(
    url,
    {
      data: encryptedData(dataToPostStr)
    },
    function(responseData){success(parseEncryptedData(responseData));}
  ).fail(fail);
}
