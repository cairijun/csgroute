<?php
include(AROOT . 'model' . DS . 'common.function.php');

function add_a_route($markers, $points, $name) {
    $markersJSON = json_encode($markers);
    $pointsJSON = json_encode($points);
    $sql = prepare(
        "INSERT INTO `routes` (`markers`,`points`,`name`,`mtime`) VALUES (?s,?s,?s,NOW())",
        array($markersJSON, $pointsJSON, $name));
    run_sql($sql);
    return last_id();
}

function edit_a_route($markers, $points, $name, $id) {
    $markersJSON = json_encode($markers);
    $pointsJSON = json_encode($points);
    $sql = prepare(
        "UPDATE `routes` SET `markers` = ?s, `points` = ?s, `name` = ?s, `mtime` = NOW() WHERE `id` = ?i",
        array($markersJSON, $pointsJSON, $name, $id));
    run_sql($sql);
    return $id;
}

function delete_a_route($id) {
    $sql = prepare(
        "DELETE FROM `routes` WHERE `id` = ?i",
        array($id));
    run_sql($sql);
}

