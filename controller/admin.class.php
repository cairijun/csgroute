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
		$data['title'] = $data['top_title'] = '管理首页';
        $data['routesList'] = get_routes_list();
        $data['js'] = array('admin.js');
		render( $data );
	}

    function ajax_save()
    {
        $routeData = json_decode($_POST['routeData'], true);
        $routeId = $_POST['routeId'];
        if(substr($routeId, 0, 1) == '#') {
            //新线路
            $newId = add_a_route(
                $routeData['markers'],
                $routeData['line'],
                substr($routeId, 1)
            );
            $ret = array('routeId' => $newId, 'content' => '插入成功！');
        }
        else {
            //修改线路
            $newId = edit_a_route(
                $routeData['markers'],
                $routeData['line'],
                $routeId
            );
            $ret = array('routeId' => $newId, 'content' => '修改成功！');
        }
        ajax_echo(json_encode($ret));
    }

    function ajax_delete()
    {
        $routeId = $_POST['routeId'];
        delete_a_route($routeId);
        ajax_echo(json_encode(array('code' => 0)));
    }
}
