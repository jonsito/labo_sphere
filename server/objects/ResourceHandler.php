<?php
require_once(__DIR__."/../logging.php");

class ResourceHandler {
    protected $user;
    protected $password;
    protected $myLogger;

    function __construct($user,$pass) {
        $this->user=$user;
        $this->password=$pass;
        $this->myLogger=new Logger("ResourceHandler",LEVEL_TRACE);
    }
    // find of type("desktop","console","tunel") on resource name ("laboA","laboB","virtual","macs","newvm")
    public function findResource($name,$type) {
        // $this->myLogger->enter("findResourece($name)");
        // PENDING: real work of find, deploy and start a free resource
        $result=array('success'=>true);
        switch($type) {
            case 'desktop': $result['port']=5910; break; // 5900 and 5901 are reserved to gdm and console displays
            case 'console': $result['port']=22; break;
            case 'tunel': $result['port']=22; break;
            default:
                $this->myLogger->error("unknown resource type {$type}");
                return  null;
        }
        switch ($name) {
            case "laboA": $result['host']="l133"; break;
            case "laboB": $result['host']="l110"; break;
            case "macs": $result['host']="l134"; break;
            case "virtual": $result['host']="l051"; break;
            case "newvm":
                $this->myLogger->error("fireup in on-demand VM's not available yet");
                return  null;
            default:
                $this->myLogger->error("unknown resource name {$name}");
                return  null;
        }
        return $result;
    }
}