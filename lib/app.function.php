<?php
function xssf($data, $is_json = false)
{
    if($is_json)
        return htmlspecialchars($data, ENT_NOQUOTES | ENT_HTML401, 'UTF-8', false);
    else
        return htmlspecialchars($data, ENT_COMPAT | ENT_HTML401, 'UTF-8', false);
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
                    add_a_log(
                        'app.function.php:check_auth():39',
                        'check_auth_error',
                        $_COOKIE['USERNAME'] . ': UA-CHECK ERROR');
                    reset_all($userid);
                    return false;
                }
            }
        }
        else
        {
            add_a_log(
                'app.function.php:check_auth():50',
                'check_auth_error',
                $_COOKIE['USERNAME'] . ': TS-CHECK ERROR');
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

function reset_all($userid, $update_cookie = false)
{
    $ts = sha1(uniqid(mt_rand() . 'TS', true));
    $tl = sha1(uniqid(mt_rand() . 'TL', true));
    $ua = sha1($_SERVER['HTTP_USER_AGENT']);
    $ip = sha1($_SERVER['REMOTE_ADDR']);

    $sql = prepare(
        "UPDATE `auth_tokens` SET `TS` = ?s, `TL` = ?s, `UA` = ?s, `IP` = ?s WHERE `USERID` = ?i",
        array($ts, $tl, $ua, $ip, $userid));
    run_sql($sql);
    if($update_cookie)
    {
        setcookie('TS', $ts, time() + 604800, '', '', false, true);
        setcookie('TL', $tl, time() + 604800, '', '', false, true);
    }
}

function user_login($username, $passhash)
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
        reset_all($data['id'], true);
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
    $sql = prepare(
        "INSERT INTO `log` (`position`, `type`, `ip`, `ua`, `content`) VALUES (?s, ?s, ?s, ?s, ?s)",
        array($position, $type, $_SERVER['REMOTE_ADDR'], $_SERVER['HTTP_USER_AGENT'], $content));
    run_sql($sql);
}

function anti_csrf($check_token = false)
{
    //检查REFERER头
    if(!isset($_SERVER['HTTP_REFERER']) || (stripos($_SERVER['HTTP_REFERER'], c('site_domain')) === false))
        output_403();
     
    if($check_token)
    {
        $tmp = (isset($_SESSION['POST_TOKEN']) && isset($_POST['postToken']) && ($_SESSION['POST_TOKEN'] == $_POST['postToken']));
        //检查令牌
        if($tmp)
            return generate_post_token();
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
    if($key == null && isset($_SESSION['KEY']))
        $key = $_SESSION['KEY'];
    else
    {
        //加密密钥未设置，禁止数据传输
        header('HTTP/1.1 403 Forbidden');
        exit();
    }

    $iv = substr(md5(uniqid(mt_rand() . '', true)), 0, 16);
    $encrypted_data = mcrypt_encrypt(MCRYPT_RIJNDAEL_128, $key, $data, MCRYPT_MODE_CBC, $iv);

    //把IV拼接在BASE64编码的加密数据前
    return $iv . base64_encode($encrypted_data);
}
