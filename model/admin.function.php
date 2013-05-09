<?php
include(AROOT . 'model' . DS . 'common.function.php');

function add_a_route($markers, $points, $name, $status = null) {
    $markersJSON = json_encode($markers);
    $pointsJSON = json_encode($points);
    $statusJSON = json_encode($status);
    $sql = prepare(
        "INSERT INTO `routes` (`markers`,`points`,`name`,`mtime`, `status`) VALUES (?s,?s,?s,NOW(),?s)",
        array($markersJSON, $pointsJSON, $name, $statusJSON));
    run_sql($sql);
    return last_id();
}

function edit_a_route($markers, $points, $name, $id, $status = null) {
    $markersJSON = json_encode($markers);
    $pointsJSON = json_encode($points);
    $statusJSON = json_encode($status);
    $sql = prepare(
        "UPDATE `routes` SET `markers` = ?s, `points` = ?s, `name` = ?s, `mtime` = NOW(), `status` = ?s WHERE `id` = ?i",
        array($markersJSON, $pointsJSON, $name, $statusJSON, $id));
    run_sql($sql);
    return $id;
}

function delete_a_route($id) {
    $sql = prepare(
        "DELETE FROM `routes` WHERE `id` = ?i",
        array($id));
    run_sql($sql);
}

function add_a_user($username, $passhash, $permissions = 10)
{
    $sql = prepare(
        "SELECT `id` FROM `users` WHERE `username` = ?s",
        array($username));
    $data = get_var($sql);
    if($data != null)
        return false;

    $salt = sha1(uniqid());
    $_passhash = sha1($passhash);
    $_passhash = sha1($passhash . $_passhash);
    $_passhash = sha1($_passhash . $salt);

    $sql = prepare(
        "INSERT INTO `users` (`username`, `passhash`, `salt`, `permissions`) VALUES (?s,?s,?s,?i)",
        array(
            $username,
            $_passhash,
            $salt,
            $permissions
        )
    );
    run_sql($sql);
    $userid = last_id();

    $sql = prepare(
        "INSERT INTO `auth_tokens` (`USERID`, `TL`, `TS`, `UA`, `IP`) VALUES (?i,?s,?s,?s,?s)",
        array(
            $userid,
            sha1(uniqid(mt_rand() . 'TL', true)),
            sha1(uniqid(mt_rand() . 'TS', true)),
            sha1(uniqid()),
            sha1(uniqid())
        )
    );
    run_sql($sql);

    return $userid;
}

function check_permissions($userid, $permissions)
{
    $sql = prepare(
        "SELECT `permissions` FROM `users` WHERE `id` = ?i",
        array($userid));
    if(get_var($sql) <= $permissions)
        return true;
    else
    {
        $GLOBALS['AUTH_ERROR'] = 'permissions_error';
        return false;
    }
}

function get_users_list()
{
    $sql = "SELECT * FROM `users` ORDER BY `id`";
    return get_data($sql);
}

function delete_a_user($userid)
{
    $sql = prepare(
        "SELECT `permissions` FROM `users` WHERE `id` = ?i",
        array($userid));
    if(intval(get_var($sql)) == 0)
        return false;

    $sql = prepare(
        "DELETE FROM `users` WHERE `id` = ?i",
        array($userid));
    run_sql($sql);
    return true;
}

function get_route_color($type)
{
    switch($type)
    {
    case '架空':
        return 'red';
    case '槽盒':
        return 'green';
    case '槽盒外':
        return 'blue';
    case '无槽盒':
        return 'darkorange';
    }
}

function import_routes($routes, $points_position)
{
    $delete_list = array();
    $add_list = array();
    foreach($routes as $a_route)
    {
        //构建删除数组
        array_push($delete_list,
            "`name` = '" . mysql_real_escape_string($a_route['name']) . "'");

        //普通井/塔
        $normal_points = array_diff($a_route['points'], $a_route['joints']);

        //构建线路数据
        $route_array = array();
        $route_path = array();
        foreach($a_route['points'] as $a_point)
            array_push($route_path, $points_position[$a_point]);
        $route_array['path'] = $route_path;
        $route_array['strokeWeight'] = 3;
        $route_array['strokeColor'] = get_route_color($a_route['type']);
        $route_array['strokeOpacity'] = 1;

        //构建井/塔数据
        $points_array = array();
        foreach($normal_points as $a_point)
            array_push($points_array, array(
                'title' => $a_point,
                'content' => $a_point,
                'position' => $points_position[$a_point]));

        foreach($a_route['joints'] as $a_point)
            array_push($points_array, array(
                'title' => $a_point,
                'content' => $a_point,
                'color' => 'cyan',
                'position' => $points_position[$a_point]));

        //地图状态
        $status_array = array(
            'center' => $points_array[0]['position'],
            'zoom' => 14);

        //构建插入数组
        array_push($add_list,
            sprintf("('%s', '%s', '%s', '%s', NOW())",
            mysql_real_escape_string(json_encode($points_array)),
            mysql_real_escape_string(json_encode($route_array)),
            mysql_real_escape_string(json_encode($status_array)),
            mysql_real_escape_string($a_route['name'])));
    }

    //删除原有同名线路
    $sql = "DELETE FROM `routes` WHERE ".
        join(' OR ', $delete_list);
    run_sql($sql);
    //插入线路
    $sql = "INSERT INTO `routes` (`markers`, `points`, `status`, `name`, `mtime`) VALUES ".
        join(',', $add_list);
    run_sql($sql);
}

