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

    function about()
    {
        $about_text = file_get_contents(AROOT . 'static' . DS . 'about.txt');
        if(!($about_text === false))
            info_page(nl2br($about_text), '关于');
    }

    //独立登录页面
    function login()
    {
        $to = preg_replace('/[<>\'";]/', '', v('to'));
        if(!g('gAuth'))
        {
            $data['title'] = $data['top_title'] = '登录';
            $data['to']  = $to;
            return render($data, 'web', 'login');
        }
        elseif(v('to') != null)
            header('Location:' . $to);
        else
            header('Location:index.php');
    }

	// login check or something

    function ajax_login()
    {
        anti_csrf();
        $username = $_POST['username'];

        $decrypted_key = json_decode(rsa_encrypt_data($_POST['key']), true);
        $passhash = $decrypted_key['passhash'];
        $key = $decrypted_key['key'];

        if(user_login($username, $passhash, $key))
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
        $_POST = parse_encrypted_post();
        anti_csrf();
        if(g('gAuth') && isset($_POST['oldpasshash']) && isset($_POST['newpasshash']))
            if(change_password($_COOKIE['USERID'], $_POST['oldpasshash'], $_POST['newpasshash']))
            {
                add_a_log(
                    'app.class.php:ajax_change_password():52',
                    'change_password_success',
                    $_COOKIE['USERNAME']);
                ajax_echo(encrypt_transfer_data(json_encode(
                    array(
                        'errno' => 0,
                        'msg' => '修改成功！'
                    ))));
            }
            else{
                add_a_log(
                    'app.class.php:ajax_change_password():64',
                    'change_password_fail',
                    $_COOKIE['USERNAME']);
                ajax_echo(encrypt_transfer_data(json_encode(
                    array(
                        'errno' => -1,
                        'msg' => '修改失败！请检查旧密码。'
                    ))));
            }
    }
}
?>
