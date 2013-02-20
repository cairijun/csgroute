<?php
if( !defined('IN') ) die('bad request');
include_once( CROOT . 'controller' . DS . 'core.class.php' );

session_start();
$gAuth = check_auth();

class appController extends coreController
{
	function __construct()
	{
		// 载入默认的
		parent::__construct();
	}

	// login check or something

    function ajax_login()
    {
        anti_csrf();
        $username = $_POST['username'];
        $passhash = $_POST['passhash'];
        if(user_login($username, $passhash))
        {
            add_a_log('app.class.php:ajax_login():23', 'login_success', $username);
            ajax_echo(json_encode(
                array(
                    'errno' => 0,
                    'msg' => $username
                )));
        }
        else
        {
            add_a_log('app.class.php:ajax_login():32', 'login_fail', $username);
            ajax_echo(json_encode(
                array(
                    'errno' => -1,
                    'msg' => '登录失败！请检查用户名和密码。'
                )));
        }
    }

    function ajax_logout()
    {
        anti_csrf();
        if(g('gAuth'))
            reset_all($_COOKIE['USERID']);
    }

    function ajax_change_password()
    {
        anti_csrf();
        if(g('gAuth') && isset($_POST['oldpasshash']) && isset($_POST['newpasshash']))
            if(change_password($_COOKIE['USERID'], $_POST['oldpasshash'], $_POST['newpasshash']))
            {
                add_a_log(
                    'app.class.php:ajax_change_password():52',
                    'change_password_success',
                    $_COOKIE['USERNAME']);
                ajax_echo(json_encode(
                    array(
                        'errno' => 0,
                        'msg' => '修改成功！'
                    )));
            }
            else{
                add_a_log(
                    'app.class.php:ajax_change_password():64',
                    'change_password_fail',
                    $_COOKIE['USERNAME']);
                ajax_echo(json_encode(
                    array(
                        'errno' => -1,
                        'msg' => '修改失败！请检查旧密码。'
                    )));
            }
    }
}
?>
