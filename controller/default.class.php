<?php
if( !defined('IN') ) die('bad request');
include_once( AROOT . 'controller'.DS.'app.class.php' );

class defaultController extends appController
{
	function __construct()
	{
		parent::__construct();
	}
	
	function index()
	{
        if(!g('gAuth'))
        {
            header('Location: ?c=app&a=login');
            exit();
        }
		$data['title'] = $data['top_title'] = '首页';
        $data['routesList'] = get_routes_list();
        $data['auth'] = g('gAuth');
        if(isset($_COOKIE['USERNAME']))
            $data['username'] = $_COOKIE['USERNAME'];
		render( $data );
	}

    function ajax_getroutes()
    {
        if(!g('gAuth'))
            output_403();
        anti_csrf();
        $route = get_a_route_by_id($_GET['route_id']);
        $send_array = array();
        $send_array[0] =
            array(
                'line' => json_decode($route['points'], true),
                'markers' => json_decode($route['markers'], true),
                'id' => $route['id'],
                'name' => $route['name'],
                'status' => json_decode($route['status'], true)
            );
        return ajax_echo(encrypt_transfer_data(json_encode($send_array)));
    }
}
	
