<?php
require_once __DIR__ . "/../../server/objects/Action.php";
require_once(__DIR__ . "/../../config/config.php");
require_once(__DIR__ . "/../../server/tools.php");
require_once(__DIR__ . "/../../server/objects/View.php");
require_once(__DIR__ . "/../../server/objects/AuthLDAP.php");
require_once(__DIR__ . "/../../server/objects/ResourceHandler.php");
$operation=http_request("Operation","s",null);
$node=http_request("name","s",null);
$parent=http_request("parent","s",null);
$level=http_request("level","i",0);
$user=http_request("username","s","");
$password=http_request("password","s","");
$type=http_request("tipo","s","");
$host=http_request("host","s","");
$port=http_request("port","i",0);
$duration=http_request("duration","i",0);

if ( in_array($operation,array('start','stop','restart','status','kill','console')) ) $a=new Action($node,$parent,$level);
if ( $operation==='fireup') {
    // authenticate user
    $auth=new AuthLDAP();
    if ($auth->login($user,$password)==false) {
        $res="Authentication error: invalid username or password";
        echo json_encode(array("success"=>false,"errorMsg"=>$res));
        return;
    }
    // create resource handle and find valid free resource of $name family
    $rh=new ResourceHandler($user,$password);
}

switch ($operation) {
    case "start": $res=$a->start($level); break; // start host
    case "stop": $res=$a->stop($level); break; // stop host
    case "restart": $res=$a->restart($level); break; // stop host
    case "status": $res=$a->status($level); break; // status host
    case "kill": $res=$a->kill($level,$node); break; // kill session(s) in requested node
    case "console": // fireup admin ssh terminal on host
        $res=$a->console($level);
        if (is_array($res)) {echo json_encode($res); return; }
        break;
    case "fireup":  // fireup instance of type("desktop","console","tunel")
        // on close tunel, verify that user selected a host
        if ( ($type==='tunel') && ($duration==0) && ($node!=='host') ) {
            $res="FireUp Error: must provide host to close tunnel to";
            break;
        }
        // on resource name ("laboA","laboB","macs","host","virtual","newvm")
        $item=$rh->fireUp($node,$type,$host,$duration);
        // return data with parameters to send via post to requested resource url
        if (is_array($item)) { echo json_encode($item); return; }
        $res="FireUp Error: cannot locate free resource of familiy $node";
        break;
    default:
        $res="actionFunctions: invalid operation $operation received";
        break;
}
if($res==null) $res=array("success"=>true,"data"=>array());
else if($res=="") $res=array("success"=>true,"data"=>array());
else if(is_string($res)) $res=array("success"=>false,"errorMsg"=>$res);
else if(is_array($res)) $res=array("success"=>true,"data"=>$res);
echo json_encode($res);
