<?php
function xssf($data, $is_json = false)
{
    $ret = '';
    if($is_json)
        $ret = htmlspecialchars($data, ENT_NOQUOTES | ENT_HTML401, 'UTF-8', false);
    else
        $ret = htmlspecialchars($data, ENT_COMPAT | ENT_HTML401, 'UTF-8', false);
    if($data != $ret)
        add_a_log(
            'app.function.php:xssf()',
            'possible_xss',
            $_COOKIE['USERNAME'] . ',' . $data);
    return $ret;
}

function pass_hash($passhash, $salt)
{
    $_passhash = sha1($passhash);
    $_passhash = sha1($passhash . $_passhash);
    $_passhash = sha1($_passhash . $salt);
    return $_passhash;
}

function check_auth()
{
    if(!(isset($_COOKIE['TS']) && isset($_COOKIE['TL']) && isset($_COOKIE['USERID'])))
        return false;

    $ts = $_COOKIE['TS'];
    $tl = $_COOKIE['TL'];
    $ip = sha1($_SERVER['REMOTE_ADDR']);
    $ua = sha1($_SERVER['HTTP_USER_AGENT']);
    $userid = intval($_COOKIE['USERID']);

    $sql = prepare("SELECT * FROM `auth_tokens` WHERE `USERID` = ?i", array($userid));
    $tokens_array = get_line($sql);
    $GLOBALS['KEY'] = $tokens_array['KEY'];

    if($tl == $tokens_array['TL'])
    {
        if($ts == $tokens_array['TS'])
        {
            if($ip == $tokens_array['IP'])
                return true;
            else
            {
                if($ua == $tokens_array['UA'])
                {
                    reset_ts($userid, true);
                    return true;
                }
                else
                {
                    $GLOBALS['AUTH_ERROR'] = 'ua_check_error';
                    reset_all($userid);
                    return false;
                }
            }
        }
        else
        {
            $GLOBALS['AUTH_ERROR'] = 'ts_check_error';
            reset_all($userid);
            return false;
        }
    }
    else
        return false;
}

function reset_ts($userid, $update_cookie = false)
{
    $ts = sha1(uniqid(mt_rand() . 'TS', true));
    $ua = sha1($_SERVER['HTTP_USER_AGENT']);
    $ip = sha1($_SERVER['REMOTE_ADDR']);

    $sql = prepare(
        "UPDATE `auth_tokens` SET `TS` = ?s, `UA` = ?s, `IP` = ?s WHERE `USERID` = ?i",
        array($ts, $ua, $ip, $userid));
    run_sql($sql);
    if($update_cookie)
        setcookie('TS', $ts, time() + 604800, '', '', false, true);
}

function reset_all($userid, $update_cookie = false, $key = null)
{
    $ts = sha1(uniqid(mt_rand() . 'TS', true));
    $tl = sha1(uniqid(mt_rand() . 'TL', true));
    $ua = sha1($_SERVER['HTTP_USER_AGENT']);
    $ip = sha1($_SERVER['REMOTE_ADDR']);

    if($key == null)
        $sql = prepare(
            "UPDATE `auth_tokens` SET `TS` = ?s, `TL` = ?s, `UA` = ?s, `IP` = ?s WHERE `USERID` = ?i",
            array($ts, $tl, $ua, $ip, $userid));
    else
        $sql = prepare(
            "UPDATE `auth_tokens` SET `TS` = ?s, `TL` = ?s, `UA` = ?s, `IP` = ?s, `KEY` = ?s WHERE `USERID` = ?i",
            array($ts, $tl, $ua, $ip, $key, $userid));
    run_sql($sql);

    if($update_cookie)
    {
        setcookie('TS', $ts, time() + 604800, '', '', false, true);
        setcookie('TL', $tl, time() + 604800, '', '', false, true);
    }
}

function user_login($username, $passhash, $key)
{
    $sql = prepare(
        "SELECT * FROM `users` WHERE `username` = ?s",
        array($username));
    $data = get_line($sql);

    //$passhash = sha1(sha1($password) + $username);
    $_passhash = pass_hash($passhash, $data['salt']);

    if($_passhash == $data['passhash'])
    {
        setcookie('USERID', $data['id'], time() + 604800);
        setcookie('USERNAME', $data['username'], time() + 604800);
        reset_all($data['id'], true, $key);
        return true;
    }
    else
        return false;
}

function change_password($userid, $oldpasshash, $newpasshash)
{
    $sql = prepare(
        "SELECT `passhash`, `salt` FROM `users` WHERE `id` = ?i",
        array($userid));
    $data = get_line($sql);

    if($data['passhash'] == pass_hash($oldpasshash, $data['salt']))
    {
        $sql = prepare(
            "UPDATE `users` SET `passhash` = ?s WHERE `id` = ?i",
            array(
                pass_hash($newpasshash, $data['salt']),
                $userid
            ));
        run_sql($sql);
        reset_all($userid);
        return true;
    }
    else
        return false;
}

function add_a_log($position, $type, $content)
{
    $auth_error = g('AUTH_ERROR');
    if($auth_error != null && strlen($auth_error) > 0)
        $content = $content . '(' . $auth_error . ')';

    $sql = prepare(
        "INSERT INTO `log` (`position`, `type`, `ip`, `ua`, `content`) VALUES (?s, ?s, ?s, ?s, ?s)",
        array($position, $type, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $content));
    run_sql($sql);
}

function anti_csrf($check_token = false)
{
    //检查REFERER头
    if(!isset($_SERVER['HTTP_REFERER']) || (stripos($_SERVER['HTTP_REFERER'], c('site_domain')) === false))
    {
        $log_content = sprintf('%s,%s,c=%s&a=%s',
            $_COOKIE['USERNAME'], $_SERVER['HTTP_REFERER'], g('c'), g('a'));

        add_a_log(
            'app.function.php:anti_csrf()',
            'csrf_invalid_referer',
            $log_content);
        output_403();
    }
     
    if($check_token)
    {
        $tmp = (isset($_SESSION['POST_TOKEN']) && isset($_POST['postToken']) && ($_SESSION['POST_TOKEN'] == $_POST['postToken']));
        //检查令牌
        if($tmp)
            return generate_post_token();

        $log_content = sprintf('%s,c=%s&a=%s',
            $_COOKIE['USERNAME'], g('c'), g('a'));
        add_a_log(
            'app.function.php:anti_csrf()',
            'csrf_invalid_token',
            $log_content);
        output_403();
    }
}

function output_403()
{
    header('HTTP/1.1 403 Forbidden');
    exit();
}

function generate_post_token()
{
    if(!isset($_SESSION))
        session_start();
    $post_token = md5(mt_rand() + uniqid());
    $_SESSION['POST_TOKEN'] = $post_token;
    return $post_token;
}

function encrypt_transfer_data($data, $key = null)
{
    if($key == null)
        $key = g('KEY');
    if($key == null)
        output_403();

    $iv = substr(md5(uniqid(mt_rand() . '', true)), 0, 16);
    $encrypted_data = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_CBC, $iv);

    //把IV拼接在BASE64编码的加密数据前
    return $iv . base64_encode($encrypted_data);
}

function decrypt_transfer_data($data, $key = null)
{
    if($key == null)
        $key = g('KEY');
    if($key == null)
        output_403();

    $iv = substr($data, 0, 16);
    $encrypted_data = base64_decode(substr($data, 16));
    $original_data = mcrypt_decrypt(MCRYPT_RIJNDAEL_128, $key, $encrypted_data, MCRYPT_MODE_CBC, $iv);
    $original_data = trim($original_data);//解密后的数据有时会多出一些不可见字符
    return $original_data;
}

//解析加密POST过来的JSON数据
function parse_encrypted_post($key = null)
{
    if(isset($_POST['data']))
    {
        return json_decode(decrypt_transfer_data($_POST['data'], $key), true);
    }
}

//RSA解密经过BASE64编码的数据
function rsa_encrypt_data($data)
{
    //下面是私钥，注意保密
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
    $original_data = '';
    if(openssl_private_decrypt(base64_decode($data), $original_data, $private_key))
        return $original_data;
    else
        return false;
}
