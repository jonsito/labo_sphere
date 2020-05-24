<?php
require_once(__DIR__."/../config/config.php");
require_once( __DIR__."/../server/tools.php" );
require_once( __DIR__."/../server/objects/View.php" );
$operation=http_request("Operation","s",null);
$v=new View();
switch ($operation) {
    case "clients":
        $res=$v->enumerate();
        break;
    case "checkgroup":
        $id=http_request("id","i",0);
        $name=http_request("name","s","");
        $children=http_request("children","s","BEGIN,END");
        $res=$v->checkGroup($id,$name,$children);
        break;
    case "checkhost":
    default:
        $res=[];
        break;
}
if($res==null) $res=array("success"=>true);
else if($res=="") $res=array("success"=>true);
else if(is_string($res)) $res=array("success"=>false,"errorMsg"=>$res);
echo json_encode($res);