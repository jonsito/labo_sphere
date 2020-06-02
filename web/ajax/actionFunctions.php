<?php
require_once __DIR__ . "/../../server/objects/Action.php";
require_once(__DIR__ . "/../../config/config.php");
require_once(__DIR__ . "/../../server/tools.php");
require_once(__DIR__ . "/../../server/objects/View.php");
$operation=http_request("Operation","s",null);
$node=http_request("name","s",null);
$parent=http_request("parent","s",null);
$a=new Action($node,$parent);
switch ($operation) {
    case "start": $res=$a->start(); break;
    case "group_start": $res=$a->group_start(); break;
    case "stop": $res=$a->stop(); break;
    case "group_stop": $res=$a->group_stop(); break;
    case "status": $res=$a->status(); break;
    case "group_info": $res=$a->group_status(); break;
    case "console": $res=$a->console(); break;
    case "group_console": $res=$a->group_console(); break;
        break;
    default:
        $res=[];
        break;
}
if($res==null) $res=array("success"=>true,"data"=>array());
else if($res=="") $res=array("success"=>true,"data"=>array());
else if(is_string($res)) $res=array("success"=>false,"errorMsg"=>$res);
else if(is_array($res)) $res=array("success"=>true,"data"=>$res);
echo json_encode($res);
