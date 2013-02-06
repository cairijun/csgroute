$(document).ready(function() {
  $('#loginform').submit(function(e) {
    e.preventDefault();
    var password = $('#password').val();
    var _passhash = CryptoJS.SHA1(password);
    _passhash = CryptoJS.SHA1(password + _passhash);
    _passhash = CryptoJS.SHA1($('#username').val() + _passhash);
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
});

function logout() {
  $.get(
    '?c=app&a=ajax_logout',
    function() {
      $('#usermenu').addClass('navbar-hide');
      $('#loginform').removeClass('navbar-hide');
    }
  );
}
