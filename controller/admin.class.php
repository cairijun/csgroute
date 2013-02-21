<?php
if( !defined('IN') ) die('bad request');
include_once( AROOT . 'controller'.DS.'app.class.php' );

class adminController extends appController
{
	function __construct()
	{
		parent::__construct();
	}
	
	function index()
	{
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:index():16',
                'Admin page error',
                $_COOKIE['USERNAME']);
            header('HTTP/1.1 403 Forbidden');
            info_page('您无权访问此页面！');
            exit();
        } 
		$data['title'] = $data['top_title'] = '管理首页';
        $data['routesList'] = get_routes_list();
        $data['usersList'] = get_users_list();
        $data['js'] = array('admin.js');
        $data['auth'] = g('gAuth');
        if(isset($_COOKIE['USERNAME']))
            $data['username'] = $_COOKIE['USERNAME'];
		render( $data );
	}

    function ajax_save()
    {
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:ajax_save():38',
                'Save route error',
                $_COOKIE['USERNAME']);
            header('HTTP/1.1 403 Forbidden');
            exit();
        } 
        $routeData = json_decode($_POST['routeData'], true);
        $routeId = $_POST['routeId'];
        if($routeId == '#') {
            //新线路
            $newId = add_a_route(
                $routeData['markers'],
                $routeData['line'],
                $_POST['routeName']
            );
            $ret = array('routeId' => $newId, 'content' => '插入成功！');
        }
        else {
            //修改线路
            $newId = edit_a_route(
                $routeData['markers'],
                $routeData['line'],
                $_POST['routeName'],
                $routeId
            );
            $ret = array('routeId' => $newId, 'content' => '修改成功！');
        }
        ajax_echo(json_encode($ret));
    }

    function ajax_delete()
    {
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:ajax_delete():73',
                'Delete route error',
                $_COOKIE['USERNAME']);
            header('HTTP/1.1 403 Forbidden');
            exit();
        } 
        $routeId = $_POST['routeId'];
        delete_a_route($routeId);
        ajax_echo(json_encode(array('code' => 0)));
    }

    function ajax_add_a_user()
    {
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 0))
        {
            add_a_log(
                'admin.class.php:ajax_add_a_user():89',
                'Add user error',
                $_COOKIE['USERNAME']);
            header('HTTP/1.1 403 Forbidden');
            exit();
        } 
        $username = $_POST['username'];
        $passhash = $_POST['passhash'];
        $ret = false;
        if(isset($_POST['permissions']))
        {
            $permissions = intval($_POST['permissions']);
            $ret = add_a_user($username, $passhash, $permissions);
        }
        else
            $ret = add_a_user($username, $passhash);
        if($ret === false)
        {
            ajax_echo(json_encode(
                array(
                    'errno' => -1,
                    'msg' => '用户名已存在！'
                )));
        }
        else
        {
            ajax_echo(json_encode(
                array(
                    'errno' => 0,
                    'msg' => intval($ret)
                )));
        }
    }

    function ajax_delete_a_user()
    {
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 0))
        {
            add_a_log(
                'admin.class.php:ajax_delete_a_user():128',
                'Delete user error',
                $_COOKIE['USERNAME']);
            header('HTTP/1.1 403 Forbidden');
            exit();
        }
        if(delete_a_user($_POST['userid']))
            ajax_echo(json_encode(array('errno' => 0)));
        else
            ajax_echo(json_encode(array('errno' => -1, 'msg' => '无法删除最高权限用户。')));
    }
}
