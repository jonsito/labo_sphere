<?php
require_once( __DIR__."/../server/tools.php" );
require_once( __DIR__."/../server/objects/View.php" );
$operation=http_request("Operation","s",null);
switch ($operation) {
    case "clients":
        $v=new View();
        $res=$v->enumerate();
        break;
    default:
        $res=[];
        break;
}
echo json_encode($res);