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
        {
            header('HTTP/1.1 403 Forbidden');
            exit();
        }
        anti_csrf();
        $route = get_a_route_by_id($_GET['route_id']);
        $send_array = array();
        $send_array[0] =
            array(
                'line' => json_decode($route['points'], true),
                'markers' => json_decode($route['markers'], true),
                'id' => $route['id'],
                'name' => $route['name']
            );
        return ajax_echo(encrypt_transfer_data(json_encode($send_array)));
    }

    function ajax_login()
    {
        if(user_login($_POST['username'], $_POST['passhash']))
            ajax_echo('OK');
    }

    function ajax_auth_test()
    {
        if(check_auth())
            ajax_echo('PASS');
    }
	
	function ajax_test()
	{
		return ajax_echo('1234');
	}
	
	function rest()
	{
		$data = array(  );
		if( intval(v('o')) == 1 )
		{
			$data['code'] = 123;
			$data['message'] = 'RPWT';
		}
		else
		{
			$data['code'] = 0 ;
			$data['data'] = array( '2' , '4' , '6' , '8' ); 
		}
		
		render( $data , 'rest' );
	}
	
	function mobile()
	{
		$data['title'] = $data['top_title'] = 'JQMobi';
		render( $data , 'mobile' );
	}
	
	function ajax_load()
	{
		return ajax_echo('Hello ' . date("Y-m-d H:i:s"));
	}
	
	function about()
	{
		return info_page( "ftqq.com 荣誉出品" , "About" );
	}
	
	function contact()
	{
		return info_page( "Sina Weibo - <a href='http://weibo.com/easy' target='_blank'>@Easy</a> |  Twitter - @Easychen" , "Follow Me" );
	}
	
	function test()
	{
		$data['title'] = $data['top_title'] = '自动测试页';
		$data['info'] = '根据访问来源自动切换Layout';
		
		return render( $data );
	}
	
	function sql()
	{
		db();
		echo $sql = prepare( "SELECT * FROM `user` WHERE `name` = ?s AND `uid` = ?i AND `level` = ?s LIMIT 1" , array( "Easy'" , '-1', '9.56' ) );	
	}
	
	
}
	
