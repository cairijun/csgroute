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
        if(!g('gAuth'))
        {
            header('Location:index.php?c=app&a=login');
            exit();
        }
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:index()',
                'admin_page_denied',
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
        $data['postToken'] = generate_post_token();
        if(isset($_COOKIE['USERNAME']))
            $data['username'] = xssf($_COOKIE['USERNAME']);
		render( $data );
	}

    function ajax_save()
    {
        $_POST = parse_encrypted_post();
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:ajax_save()',
                'save_route_denied',
                $_COOKIE['USERNAME'] . ',' . $_POST['routeId']);
            output_403();
        }
        $newToken = anti_csrf(true);
        //$routeData = json_decode($_POST['routeData'], true);
        $routeData = $_POST['routeData'];
        $routeId = $_POST['routeId'];
        $status = $_POST['status'];
        if($routeId == '#') {
            //新线路
            $newId = add_a_route(
                $routeData['markers'],
                $routeData['line'],
                xssf($_POST['routeName']),
                $status
            );
            $ret = array('routeId' => $newId, 'content' => '插入成功！', 'token' => $newToken);
        }
        else {
            //修改线路
            $newId = edit_a_route(
                $routeData['markers'],
                $routeData['line'],
                xssf($_POST['routeName']),
                $routeId,
                $status
            );
            $ret = array('routeId' => $newId, 'content' => '修改成功！', 'token' => $newToken);
        }
        ajax_echo(encrypt_transfer_data(json_encode($ret)));
    }

    function ajax_delete()
    {
        $_POST = parse_encrypted_post();
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:ajax_delete()',
                'delete_route_denied',
                $_COOKIE['USERNAME'] . ',' . $_POST['routeId']);
            output_403();
        } 
        $newToken = anti_csrf(true);
        $routeId = $_POST['routeId'];
        delete_a_route($routeId);
        ajax_echo(encrypt_transfer_data(json_encode(array('code' => 0, 'token' => $newToken))));
    }

    function ajax_add_a_user()
    {
        $_POST = parse_encrypted_post();
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 0))
        {
            add_a_log(
                'admin.class.php:ajax_add_a_user()',
                'add_user_denied',
                $_COOKIE['USERNAME'] . ',' . $_POST['username']);
            output_403();
        } 
        $newToken = anti_csrf(true);
        $username = xssf($_POST['username']);
        $passhash = xssf($_POST['passhash']);
        $ret = false;
        if(isset($_POST['permissions']))
        {
            $permissions = intval($_POST['permissions']);
            if($permissions == 0)
            {
                add_a_log(
                    'admin.class.php:ajax_add_a_user()',
                    'add_root_user_denied',
                    $_COOKIE['USERNAME'] . ',' . $_POST['username']);
                return ajax_echo(encrypt_transfer_data(json_encode(
                    array(
                        'errno' => -2,
                        'msg' => '无法添加最高权限用户！',
                        'token' => $newToken
                    ))));
            }
            $ret = add_a_user($username, $passhash, $permissions);
        }
        else
            $ret = add_a_user($username, $passhash);
        if($ret === false)
        {
            ajax_echo(encrypt_transfer_data(json_encode(
                array(
                    'errno' => -1,
                    'msg' => '用户名已存在！',
                    'token' => $newToken
                ))));
        }
        else
        {
            add_a_log(
                'admin.class.php:ajax_add_a_user()',
                'add_user_success',
                $_COOKIE['USERNAME'] . ',' . $_POST['username']);
            ajax_echo(encrypt_transfer_data(json_encode(
                array(
                    'errno' => 0,
                    'msg' => intval($ret),
                    'token' => $newToken
                ))));
        }
    }

    function ajax_delete_a_user()
    {
        $_POST = parse_encrypted_post();
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 0))
        {
            add_a_log(
                'admin.class.php:ajax_delete_a_user()',
                'delete_user_error',
                $_COOKIE['USERNAME'] . ',' . $_POST['userid']);
            output_403();
        }
        $newToken = anti_csrf(true);
        if(delete_a_user($_POST['userid']))
            ajax_echo(encrypt_transfer_data(json_encode(array('errno' => 0, 'token' => $newToken))));
        else
            ajax_echo(
                encrypt_transfer_data(
                    json_encode(
                        array('errno' => -1, 'msg' => '无法删除最高权限用户。', 'token' => $newToken)
                    )));
    }

    function ajax_upload_data_file()
    {
        if(!g('gAuth') || !check_permissions($_COOKIE['USERID'], 5))
        {
            add_a_log(
                'admin.class.php:ajax_upload_data_file()',
                'upload_data_file_denied',
                $_COOKIE['USERNAME']);
            output_403();
        }
        $newToken = anti_csrf(true);

        //检查潜在文件上传攻击
        $routes_file = $_FILES['routesfile']['tmp_name'];
        $markers_file = $_FILES['markersfile']['tmp_name'];
        if(!is_uploaded_file($routes_file) || !is_uploaded_file($markers_file))
        {
            add_a_log(
                'admin.class.php:ajax_upload_data_file()',
                'upload_file_attack',
                $_COOKIE['USERNAME'] . ',' . $routes_file . ',' .$markers_file);
            output_403();
        }

        $markers_position = parse_markers_file($markers_file);
        if(!is_array($markers_position))
        {
            ajax_echo(
                json_encode(
                    array('errno' => -1, 'msg' => $markers_position, 'token' => $newToken)));
            exit();
        }

        $routes = parse_routes_file(
            $routes_file,
            $_POST['startrn'],
            $_POST['col1'],
            $_POST['col2'],
            $_POST['col3'],
            $_POST['col4'],
            $_POST['col5']);
        if(!is_array($routes))
        {
            ajax_echo(
                json_encode(
                    array('errno' => -2, 'msg' => $routes, 'token' => $newToken)));
            exit();
        }

        import_routes($routes, $markers_position);

        ajax_echo(
            json_encode(
                array('errno' => 0, 'msg' => '导入成功！', 'token' => $newToken)));
    }
}
