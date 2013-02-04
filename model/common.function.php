<?php
function get_a_route_by_id($id) {
    $sql_select = prepare(
        "SELECT `id`,`markers`,`points`,`options`,`name` FROM `routes` WHERE `id` = ?i",
        array($id));
    $sql_update = prepare(
        "UPDATE `routes` SET `visit` = `visit` + 1 WHERE `id` = ?i",
        array($id));
    run_sql($sql_update);
    return get_line($sql_select);
}

function get_routes_list() {
    $sql = "SELECT `id`,`name` FROM `routes` ORDER BY `visit` DESC";
    return get_data($sql);
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
                    reset_all($userid);
                    return false;
                }
            }
        }
        else
        {
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
    $_passhash = sha1($passhash);
    $_passhash = sha1($passhash + $_passhash);
    $_passhash = sha1($_passhash + $data['salt']);

    if($_passhash == $data['passhash'])
    {
        setcookie('USERID', $data['id'], time() + 604800);
        reset_all($data['id'], true);
        return true;
    }
    else
        return false;
}
