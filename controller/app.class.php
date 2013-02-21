<?php
if( !defined('IN') ) die('bad request');
include_once( CROOT . 'controller' . DS . 'core.class.php' );

$gAuth = check_auth();
session_start();

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
        if(g('gAuth'))
            reset_all($_COOKIE['USERID']);
    }

    function ajax_change_password()
    {
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

    function ajax_set_key()
    {
        if(!g('gAuth'))
        {
            header('HTTP/1.1 403 Forbidden');
            exit();
        }

        $private_key_pem_file = '-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQDVlB0xmT4/eSNixAX82h6FaqEGK2Z/iNtw0q35vGMk2r2zcgiX
pILyoUgglbBcnl1ZKqIFcU48+FxWj6r4rEP+GlahzhiXYEFAj6nIRDXz/xY0Uefr
la8hYG1Y5pNzVvCro9COxoZVcy64UCF6AquyI1fQr+uSLDWPIoU86qynmQIDAQAB
AoGAJ8CHpoGlSl8brPhbPPLEF4T/L4zIaRhp75fm9cKQmX11LX8eBkuCa/KE4Du8
NaDsMvpyaZzrOQHo/duDsQEvLjdAScFAd9BUy0z4uDbcudGonrs4w1WyKLrkFObj
5TC3QfDBfUoY3PBhsePCseBWbj6r1Ykc2ivM7keSmEBlkuECQQD29rDCqJarW1PS
wcNERIGkwJwuMUMG8IqVQUi7WPTsbEr5uzIGMhPqmxDSOPymxYj1XUnTojffHqhn
C2CYOYudAkEA3WS0nJRJuYtk9OY7UrJC6gCha0o6SDJYOu6eEBiz9lLK28rw+HH+
bsqXuJNftB9GfxInZDuELXW4FqrZHHmBLQJBAKSWohUJQGjxU7sJMXbk5TYEu9G5
OP99/g4c1TkuvwR1473tuRgR9d4L/Djui8slqPJFevdVjEDh8L/EAFtTNq0CQFpn
Cd06LBSo1/Oso6K0CeDVmxRdfgkHDcIat85o1+uIiS9Q4i8BFV0WOvfyrcy2TKoM
tqsWJnYNsLsIzpjzAI0CQCc/mmkkxT4DSH2bt4ffGEkyLdU6pvtpFZyPoQ3gfbLP
AZsVXk+Dp2qpkKdTM+H5bNnft5n5SJynNJ/KXvnevDo=
-----END RSA PRIVATE KEY-----
';
        $private_key = openssl_pkey_get_private($private_key_pem_file);
        if(isset($_POST['key']))
        {
            $key = '';
            if(openssl_private_decrypt(base64_decode($_POST['key']), $key, $private_key))
            {
                $_SESSION['KEY'] = $key;
                ajax_echo(json_encode(array('code' => 0)));
            }
            else
                ajax_echo(json_encode(array('code' => -1)));
        }
        else
            ajax_echo(json_encode(array('code' => -2)));
    }
}
?>
