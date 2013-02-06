<?php
if( !defined('IN') ) die('bad request');
include_once( CROOT . 'controller' . DS . 'core.class.php' );

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
        $username = $_POST['username'];
        $passhash = $_POST['passhash'];
        if(user_login($username, $passhash))
        {
            ajax_echo(json_encode(
                array(
                    'errno' => 0,
                    'msg' => $username
                )));
        }
        else
        {
            ajax_echo(json_encode(
                array(
                    'errno' => -1,
                    'msg' => '登录失败！请检查用户名和密码。'
                )));
        }
    }

    function ajax_logout()
    {
        if(g('gAuth'))
            reset_all($_COOKIE['USERID']);
    }

    function ajax_change_password()
    {
        if(g('gAuth'))
            if(change_password($_COOKIE['USERID'], $oldpasshash, $newpasshash))
            {
                ajax_echo(json_encode(
                    array(
                        'errno' => 0,
                        'msg' => '修改成功！'
                    )));
            }
            else{
                ajax_echo(json_encode(
                    array(
                        'errno' => -1,
                        'msg' => '修改失败！请检查旧密码。'
                    )));
            }
    }
}
?>
