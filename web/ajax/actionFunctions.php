<?php
require_once __DIR__ . "/../../server/objects/Action.php";
require_once(__DIR__ . "/../../config/config.php");
require_once(__DIR__ . "/../../server/tools.php");
require_once(__DIR__ . "/../../server/objects/View.php");
$operation=http_request("Operation","s",null);
$node=http_request("name","s",null);
$parent=http_request("parent","s",null);
$level=http_request("level","i",0);
$a=new Action($node,$parent,$level);

switch ($operation) {
    case "start": $res=$a->start($level); break;
    case "stop": $res=$a->stop($level); break;
    case "status": $res=$a->status($level); break;
    case "console":
        $res=$a->console($level);
        if (is_array($res)) {echo json_encode($res); return; }
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
