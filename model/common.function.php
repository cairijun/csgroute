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

